# moddex

A reverse index of Twitch moderator and VIP roles.

Twitch only lets a broadcaster see their own mod/VIP list. The value here is the
inverse — given a user, which channels do they hold mod or VIP on. That index is
crowdsourced: looking up `/channel/x` scrapes x's mod and VIP lists into the
database, which is what lets `/user/y` answer "y mods for x".

|              |                                                                  |
| ------------ | ---------------------------------------------------------------- |
| Stack        | Next.js 14 (App Router), React 18, TypeScript, HeroUI + Tailwind |
| Database     | MariaDB 11                                                       |
| Auth         | NextAuth v5 (Twitch provider)                                    |
| Data sources | Twitch private GQL, Twitch Helix, [ivr.fi](https://api.ivr.fi)   |
| Public API   | `/api/v1/...`, documented at `/api/docs`                         |

---

## Quick start

Docker is the only prerequisite.

```bash
git clone <repo> && cd moddex
cp .env.example .env      # fill in the twitch + stripe values
docker compose up
```

|         |                                                                  |
| ------- | ---------------------------------------------------------------- |
| App     | http://localhost:4999                                            |
| Adminer | http://localhost:8080 (server `db`, user/pass/database `moddex`) |

The database is created and seeded from `db/init/*.sql` on first boot, so the
stack comes up with demo channels, moderators, VIPs and the full badge set — no
Twitch credentials needed just to see it render. Try
[`/channel/demochannel`](http://localhost:4999/channel/demochannel) and
[`/user/modalpha`](http://localhost:4999/user/modalpha).

Source is bind-mounted, so hot reload works as usual.

### Things that will trip you up

- **Port already in use.** Set `APP_PORT` / `DB_PORT_HOST` in `.env` if 4999 or
  3306 are taken on the host.
- **Do not quote values in `.env`.** Compose strips quotes but
  `docker run --env-file` does not, so `DB_USER="bob"` becomes the literal
  `"bob"` and authentication fails with a confusing error.
- **`.env.local` wins over `.env`.** Next.js loads it at higher priority. If you
  have one left over pointing at a production database, rename it — Compose
  pins the `DB_*` variables, but nothing else is protected.
- **Re-seeding.** `db/init/*.sql` only runs against an empty data volume:
  `docker compose down -v && docker compose up`.

### Environment

See `.env.example` for the full list. Two entries are easy to get wrong:

- `AUTH_TWITCH_CLIENT_ID` is the **web** client-id used against the private GQL
  endpoint that serves mod/VIP lists. It is not the OAuth app id
  (`AUTH_TWITCH_ID`) used for login.
- `NEXT_PUBLIC_PUBLISHABLE_SECRET_KEY` is inlined into the client bundle at
  build time, so the production image needs it as a `--build-arg`, not only as a
  runtime variable.

---

## Common tasks

```bash
docker compose up                      # start the dev stack
docker compose logs -f app             # follow app logs
docker compose down                    # stop
docker compose down -v                 # stop and wipe the database
docker compose exec db mariadb -umoddex -pmoddex moddex

npx tsc --noEmit                       # typecheck
npm run lint                           # eslint --fix
```

Running without Docker still works (`npm install && npm run dev`) but needs a
MariaDB you point `DB_HOST` at yourself.

---

## Production

Images are built by `.github/workflows/build.yml` and pushed to GHCR on every
push to `main` and every `v*` tag.

On the server:

```bash
cp .env.example .env      # real values, IMAGE=ghcr.io/<owner>/<repo>
docker compose -f compose.prod.yaml pull
docker compose -f compose.prod.yaml up -d
```

The stack is app + MariaDB + a nightly backup job. It assumes a reverse proxy on
an external Docker network named `web` terminates TLS and forwards to
`app:4999`; the app publishes no host port itself.

- **Health:** `GET /api/health` reports the process and the database separately.
- **Rollback:** set `IMAGE_TAG` to an earlier `sha-` tag in `.env`, then `pull`
  and `up -d` again.
- **Backups:** the `backup` service dumps to `./backups` daily and keeps 14 days
  (`BACKUP_RETENTION_DAYS`). Restore with
  `gunzip -c backups/<file>.sql.gz | docker compose -f compose.prod.yaml exec -T db mariadb -u root -p<pass> <db>`.

---

## Layout

```
db/init/            schema + seed, applied to an empty database on first boot
docs/               REBUILD-PLAN.md — roadmap and known issues
scripts/backup.sh   loop used by the backup service
src/actions/        server actions (each one is a public endpoint — see below)
src/app/            routes: pages + /api/v1
src/utils/          data access, twitch clients, formatting
src/misc/           database pool, logger, shared types
```

**Server actions are public HTTP endpoints.** Every export of a `'use server'`
file is callable by anyone with the action id, so mutations there derive the
acting user from `auth()` and never trust a `userId` argument. Modules that
should never be reachable from a browser import `server-only`.

Known issues and the plan for them live in
[`docs/REBUILD-PLAN.md`](docs/REBUILD-PLAN.md).
