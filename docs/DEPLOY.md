# Deploying moddex

Target: `v2202408230798280300.bestsrv.de`. Written 2026-08-06.

The short version: CI builds an image on every push to `main`, the server pulls
it and runs `compose.prod.yaml`. There is no build step on the server.

Companion docs: [`RESTORE.md`](RESTORE.md) for moving the database across,
[`NEXT-STEPS.md`](NEXT-STEPS.md) for what is still outstanding.

---

## 0. What you need before starting

- Docker Engine + the compose plugin on the server.
- A reverse proxy terminating TLS — see §2. **`compose.prod.yaml` will not start
  without it**, because it joins an external network called `web` and publishes
  no host port of its own.
- DNS: `moddex.tv` (and `status.moddex.tv` if you keep the status page) pointing
  at the server.
- A GitHub PAT with `read:packages`. **The repo is private, so the image is
  private too** — the server cannot pull it anonymously.

## 1. Directory layout

```sh
mkdir -p /srv/moddex.tv && cd /srv/moddex.tv
```

The server only needs four things from the repo — it never builds:

```
/srv/moddex.tv/
├── compose.prod.yaml
├── .env                 # secrets, never committed
├── db/init/             # only applied to an EMPTY database volume
└── scripts/backup.sh
└── backups/             # created by the backup service
```

Easiest is a shallow clone, which also makes updates a `git pull`:

```sh
git clone --depth 1 https://github.com/moddextv/moddex-web.git /srv/moddex.tv
```

## 2. The reverse proxy

`compose.prod.yaml` assumes something already terminates TLS on a Docker
network named `web` and forwards to `app:4999`. Create the network once:

```sh
docker network create web
```

If you do not already have a proxy, Caddy is the least configuration. Run it in
its own compose file, joined to the same network:

```yaml
# /srv/proxy/compose.yaml
services:
  caddy:
    image: caddy:2
    restart: unless-stopped
    ports: ['80:80', '443:443']
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy-data:/data
    networks: [web]
networks:
  web:
    external: true
volumes:
  caddy-data:
```

```
# /srv/proxy/Caddyfile
moddex.tv {
    reverse_proxy app:4999
}
```

Caddy gets certificates automatically. `app` resolves because both containers
are on `web`.

## 3. `.env`

Copy `.env.example` and fill it in. Values that matter on the server, beyond the
secrets you already have:

```sh
IMAGE=ghcr.io/moddextv/moddex-web     # note: renamed from modchecker-web
IMAGE_TAG=latest                       # or a specific sha, see §7
DB_NAME=moddex_web
NEXTAUTH_URL=https://moddex.tv         # must match the twitch redirect exactly
AUTH_TRUST_HOST=true                   # required behind a proxy
STRIPE_WEBHOOK_SECRET=whsec_...        # §6 — donations are lost without it
BACKUP_RETENTION_DAYS=14
```

Three traps:

- **Do not copy `.env.local` to the server.** Next.js loads it at _higher_
  precedence than `.env`, and the copy in this repo still points
  `NEXTAUTH_URL` at `https://modchecker.com`. Delete it — but delete only the
  copy you are about to deploy from.

  **Not** the one in `/home/dev/modchecker.com/` on the host. That directory is
  a checkout of this repo and _used_ to be the live app, back when nginx
  proxied `modchecker.com` to a bare `next-server` on `127.0.0.1:4999` out of
  it. Its `.env.local` pinned that app to `https://modchecker.com` and
  `DB_NAME=modchecker_web`.

  **Superseded 2026-08-07.** nginx is `inactive` and `disabled`, Caddy serves
  everything, and `moddex.tv` is a container. The directory is no longer live
  and the trap above no longer applies to it — but do not treat it as gone
  either, because three things from that era are still running on the host:

  - a **bare `next-server` (v14.2.28) still holding `:4999`**, up 21 h, ~65 MB
    resident, and not answering (`curl` to it returns nothing). Nothing
    proxies to it since nginx was disabled, so it is an orphan, not a service.
  - **host MySQL/MariaDB, still `active`**, holding the pre-split
    `modchecker_web` database. The containerised database in
    `/srv/api.moddex.tv/` is a _separate_ restore — this is the old copy, and
    it is a second set of user data sitting on the same box.
  - the checkout itself, `.env.local` and all.

  None of it is load-bearing. All of it is worth a deliberate decision rather
  than leaving it to rot: stop the orphan, take a final dump of the host
  database if you want one, then retire both.

- `NEXTAUTH_URL` must match a redirect URL registered in the Twitch console
  character for character, or login fails.
- `APP_PORT` / `DB_PORT_HOST` are local-development only. `compose.prod.yaml`
  publishes no host ports.

## 4. Pull the image

```sh
echo "$GITHUB_PAT" | docker login ghcr.io -u <your-github-user> --password-stdin
docker compose -f compose.prod.yaml pull
```

## 5. First run and the database

Order matters here. See [`RESTORE.md`](RESTORE.md) for the detail.

```sh
# 1. bring up the database alone, so init runs against an empty volume
docker compose -f compose.prod.yaml up -d db

# 2. restore the migrated dump (001 and 005 are already baked into it)
gzcat moddex-prod-migrated-2026-08-06.sql.gz \
  | docker compose -f compose.prod.yaml exec -T db \
      mariadb -u root -p"$DB_ROOT_PASS" moddex_web

# 3. apply the migrations that are NOT in the dump
for m in 004 006 007 008 009 010 011; do
  docker compose -f compose.prod.yaml exec -T db \
    mariadb -u root -p"$DB_ROOT_PASS" moddex_web < db/migrations/${m}-*.sql
done

# 4. now the app
docker compose -f compose.prod.yaml up -d
```

`002` is deliberately **not** in that loop. It rewrites 13.7M rows, took well
over 30 minutes in rehearsal, and the application does not read the `roles`
table yet — so it buys nothing until the data-layer switch lands. When you do
run it, run it detached or under `tmux`: a dropped client connection kills it
mid-way, and a partial run looks healthy unless you count **per role**:

```sql
SELECT role, COUNT(*) FROM roles GROUP BY role;   -- 1 = mods, 2 = vips
```

## 6. Stripe webhook

**Until this is done, no donation is recorded.** The success page is read-only
by design; `/api/stripe/webhook` is the only thing that writes.

1. Stripe dashboard → Developers → Webhooks → add endpoint
   `https://moddex.tv/api/stripe/webhook`
2. Events: `checkout.session.completed` and
   `checkout.session.async_payment_succeeded`
3. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`, then
   `docker compose -f compose.prod.yaml up -d app`

Without the secret the route returns 500 and logs why, rather than trusting
unsigned traffic. Stripe retries non-2xx for ~3 days, so donations that arrive
before you finish this are recoverable — replay them from the dashboard.

## 7. Updating

CI publishes on every push to `main` and on `v*` tags.

```sh
cd /srv/moddex.tv
git pull                                        # for compose/db/init changes
docker compose -f compose.prod.yaml pull
docker compose -f compose.prod.yaml up -d
```

Apply any new `db/migrations/*.sql` **before** the new image starts if a
migration is a prerequisite for the code — `NEXT-STEPS.md` §1b has the one
known case.

**Rollback:** set `IMAGE_TAG` to a previous commit sha in `.env`, then
`pull && up -d`. Pin `IMAGE_TAG` to a sha rather than `latest` if you want
deploys to be deliberate.

## 8. Backups

The `backup` service is a long-lived container running `scripts/backup.sh`: a
`mariadb-dump` every `BACKUP_INTERVAL_SECONDS` (default 86400) into `./backups`,
retained `BACKUP_RETENTION_DAYS` (default 14), oldest pruned automatically.

It travels with the stack rather than living in host cron, so it cannot be
forgotten — but it writes to the **same disk as the database**. Copy `./backups`
off the box regularly; a dump next to the thing it backs up is not a backup.

Verify one is actually being written:

```sh
ls -la /srv/moddex.tv/backups/
docker compose -f compose.prod.yaml logs backup | tail
```

## 9. Verify the deploy

```sh
docker compose -f compose.prod.yaml ps          # all healthy
curl -fsS https://moddex.tv/api/health          # 200
curl -fsS "https://moddex.tv/api/v1/mods?channel=forsen" | head -c 200
```

Then by hand: log in with Twitch (exercises `NEXTAUTH_URL` and the redirect),
load a channel page, and check the avatar renders in the header.

Optionally run the integration suite against the live host:

```sh
TEST_BASE_URL=https://moddex.tv npm run test:integration
```

Note it hits real endpoints and can trigger outbound Twitch scraping.

## 10. Things that have bitten before

- **`AUTH_SECRET` rotation logs everyone out**, including you. That is the only
  way to revoke a live session — `perms` is baked into the JWT at sign-in, so
  removing someone's admin badge does not downgrade their current session.
- **Image optimisation needs `sharp`'s musl binaries.** The lockfile was missing
  them, which only ever showed up in production because `next dev` falls back to
  a built-in optimiser. Fixed — but if avatars ever stop rendering, check
  `docker compose exec app node -e 'require("sharp")'` first.
- **`db/init/` only runs on an empty volume.** It will never touch an existing
  database, so schema changes after the first deploy must be migrations.
- **`NEXT_PUBLIC_PUBLISHABLE_SECRET_KEY` is baked in at build time**, not
  runtime. Changing it in `.env` does nothing; it needs a rebuild with the repo
  secret set.
