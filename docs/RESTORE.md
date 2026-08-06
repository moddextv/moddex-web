# Transfer and restore

## Naming (renamed 2026-08-06)

| thing | name |
|---|---|
| github repo | `moddextv/moddex-web` (was `modchecker-web`) |
| database | `moddex_web` (was `modchecker_web`) |
| deploy directory | `/srv/moddex.tv` — or wherever, but name it after the domain |
| compose project | `moddex` (the `name:` in both compose files) |
| ci image | `ghcr.io/moddextv/moddex-web` — follows the repo name automatically |

Github keeps a redirect from the old repo path, so existing clones and remotes
keep working; update them anyway (`git remote set-url`). Images published under
the old `ghcr.io/moddextv/modchecker-web` path are **not** renamed — the next CI
run publishes under the new name, and `IMAGE` in the server `.env` has to match.

The compose project name is deliberately left as `moddex`: it prefixes the
volumes (`moddex_db-data`) and containers, so changing it would orphan the
database volume on an existing deploy.

Two places still say "modchecker" on purpose: the SEO keyword list in
`src/app/layout.tsx` (people still search for it) and the descriptive text in
`docs/` and `db/migrations/` explaining what was renamed.


Written 2026-08-06, when the project went on hold. The data is frozen as of
that date.

## What you are carrying

Neither file is in git — `.gitignore` has `*.sql.gz`, deliberately. They must
be copied across by hand.

| file | size | what it is |
|---|---|---|
| `modchecker_web-2026-08-06.sql.gz` | 423 MB | the original production dump, **untouched**. Pre-migration. |
| `moddex-prod-migrated-2026-08-06.sql.gz` | ~400 MB | the same data with `001` and `005` **already applied**. |

Restore the **migrated** one unless you specifically want the original state.
It saves you running the migrations and it is the version that has been
verified.

Also not in git, and needed on the server:

- `.env` — every secret. (Already on your transfer server.)
- `.env.local` — **do not carry this across.** It still contains
  `NEXTAUTH_URL=https://modchecker.com`, and Next.js loads `.env.local` at
  *higher* precedence than `.env`, so it silently overrides the real value
  outside Docker. Delete it.

## What is in the migrated dump

Everything in the 2026-08-06 production data, plus:

- **`001-indexes-and-audit-fix.sql`** — redundant indexes dropped, covering
  index `(channel_id, granted)` added on `mods`/`vips`, missing indexes added
  on `dctwitchusers.twitch_id` and `donations.user_id`, and `audit`.`id` given
  its `AUTO_INCREMENT`. 406 MB smaller than the original.
- **`005-repair-top-donator-badge.sql`** — the top donator badge redistributed
  from 26 incorrect holders to the single correct one (`lenaslayy`, $25.00).

Row counts, unchanged by either migration:

```
mods 8,131,260   vips 5,611,594   users 2,751,685   user_badges 656,741
snapshots 2,014  donations 64     dctwitchusers 42  user_chat_badges 59
badges 11        chat_badges 7    tokens 1          audit 0
```

The dump is portable: it contains no `CREATE DATABASE` or `USE`, so it restores
into whichever database you point it at. It does contain
`DROP TABLE IF EXISTS`, so restoring over a stack already seeded from
`db/init/` replaces those tables cleanly rather than colliding.

## Restoring

```sh
# into a running compose.prod.yaml stack
gzcat moddex-prod-migrated-2026-08-06.sql.gz \
  | docker compose -f compose.prod.yaml exec -T db \
      mariadb -u root -p"$DB_ROOT_PASS" moddex_web
```

Then verify — the row counts above, and:

```sql
-- must be exactly one row
SELECT ub.user_id, u.login FROM user_badges ub
JOIN badges b ON ub.badge_id = b.id
LEFT JOIN users u ON u.id = ub.user_id
WHERE b.name = 'top donator';
```

## Order of operations on the new server

Because the migrations are already baked into the dump, the sequence in
`NEXT-STEPS.md` §1b collapses to:

1. Bring up `compose.prod.yaml` (needs the external `web` network and a reverse
   proxy terminating TLS — see §1, still unresolved).
2. Restore the migrated dump.
3. Deploy the current `main`.
4. Add the webhook endpoint in Stripe and set `STRIPE_WEBHOOK_SECRET`. Until
   it is set, `/api/stripe/webhook` refuses with a 500 rather than trusting
   unsigned traffic, and **no donation will be recorded**.

Do **not** also apply `001` or `005` — they are already in this dump. Both are
rerun-safe, so doing it anyway is harmless, just pointless.

**Outstanding after this restore** (updated 2026-08-06, when the restore was
actually performed — this list was written before `006`–`012` existed):

```
002-unified-roles                     007-reconcile-donator-badges
004-rebrand-chat-badge-labels         008-revoke-unearned-donator-badges
006-founders-table                    009-revoke-staff-access
                                      010-reset-staff-to-admins-only
                                      011-strip-departed-vanity-badges
                                      012-known-bots
```

Nine, not three. `007`–`011` **mutate live rows** — they revoke badges and
staff access from real accounts — so they want reviewing individually rather
than running as a batch.

`006` is a special case: `db/init/01-schema.sql` already creates the `founders`
table, so a fresh stack has it and only the restored production data does not.

There is no `003`. It is an unwritten to-do (`NEXT-STEPS.md` §3: convert
`users.id` to `BIGINT UNSIGNED`, add the foreign keys), not a missing file.

## If you restore the original dump instead

Then the full §1b ordering applies: **`001` → deploy code → set
`STRIPE_WEBHOOK_SECRET` → `005`**. `001` before the code specifically, because
`audit`.`id` has no `AUTO_INCREMENT` in the original and `db.query` now throws
where it used to swallow.
