# Rebuild plan

The roadmap and its reasoning. Companion to [`NEXT-STEPS.md`](NEXT-STEPS.md)
(what is outstanding) and [`DATABASE.md`](DATABASE.md) (the measured schema
analysis).

> **Reconstructed 2026-08-07.** Two documents linked this file and it existed
> nowhere — not in `docs/`, not anywhere in git history. So this is not a
> recovered original; it is the plan written down as it actually stands, from
> the state of the five repos and the running estate. Where a number is quoted
> it comes from `DATABASE.md` or from a rehearsal recorded in `NEXT-STEPS.md`,
> not from memory of a document nobody has.

---

## Why the split exists

`modchecker.com` was one Next.js app holding the UI, the API, the Twitch
scraping and the database connection. That is a perfectly good shape until two
things happen at once: the API gets consumers you do not control (the
FrankerFaceZ add-on), and the scraping starts costing more than the rendering.
At that point a UI deploy restarts the thing answering other people's API
calls, and a scraping bug takes the website down with it.

Five repos, one container each:

| repo | host | owns |
|---|---|---|
| `moddex-api` | api.moddex.tv | the database, the scraping, the public `/v1` surface |
| `moddex-web` | moddex.tv | the UI, and nothing else |
| `moddex-ws` | ws.moddex.tv | websocket fan-out (not built) |
| `moddex-status` | status.moddex.tv | monitoring, sharing nothing with the above |
| `moddex-workspace` | — | the shared context and conventions |

**The one rule:** only `moddex-api` talks to the database. It is what stops
five repos becoming a distributed monolith, which would be strictly worse than
the single app they came from.

## Where it got to

- **Phase 1 — extract the api.** Done. `db/`, `utils/api/twitch/`,
  `utils/roles/` and the `/v1` routes rebuilt as a plain express service, with
  the response contracts pinned by an integration suite.
- **Phase 2 — repoint the web app.** Done. `moddex-web` holds no database
  connection; it asks the api over HTTP. The rule above is now true rather
  than aspirational.
- **The second migration nobody wrote down.** The split was always two
  migrations, not one: five repos *and* nginx + bare-Node + host-MySQL →
  Compose. Both are done. Caddy terminates TLS from `/srv/caddy/`, every
  service is a container, and the database lives in a volume owned by
  `moddex-api`.
- **Deployed and carrying real data.** 2.7M users, 8.1M mods, 5.6M vips.
  Nightly backups, 14 days retained.

## What is left, and the order it has to happen in

**1. Unify the roles tables.** `mods` and `vips` are one table per role. Adding
founder made it three; artist would make it four — four near-identical tables,
four query paths, four endpoints. `DATABASE.md` measured the unified shape as a
wash on speed at two roles and ~4% smaller on disk, so **the case is structural,
not performance**. Do not sell it as a speed win.

The ordering here is the thing people get wrong, and it is why migration `002`
is still outstanding despite being written and rehearsed:

> `002` is a **one-shot backfill**. It copies `mods` and `vips` into `roles`
> and installs no dual-write and no trigger. The application keeps writing to
> `mods`/`vips` — `storeUsers` does DELETE-all + INSERT-all per channel — so
> `roles` starts going stale on the first channel refresh after it runs. And it
> cannot simply be re-run: the primary key is `(user_id, channel_id, role)`, so
> a second pass collides on duplicates.
>
> **So `002` must run adjacent to the code switch, not before it.** Running it
> early does not get you ahead; it gets you a snapshot that is wrong by an
> unknown amount and expensive to redo.

The sequence: switch the data layer to `roles` (~6 files — `utils/roles/*`,
the `/v1` role routes, `misc/Interfaces.ts`, driven from `src/misc/roles.ts` so
the role name stops being interpolated into SQL) → apply `002` in the same
window → verify **per role**, because `COUNT(*)` on a half-migrated table still
returns a big believable number → deploy → only then uncomment the drops.

Budget well over 30 minutes and run it on a connection that cannot be
interrupted. A rehearsal died part-way with `ERROR 2026 (HY000): TLS/SSL error`
and left role 1 populated and role 2 empty.

**2. Migration `003`.** Convert `users.id` to `BIGINT UNSIGNED`, add the
foreign keys `002` had to defer, drop `mods`/`vips`. Only once the app is live
on `roles`.

**3. The application-side performance work.** `DATABASE.md`'s conclusion is
that the database is not the bottleneck — the join fan-out and the round trips
are. Row-at-a-time inserts in `storeUsers`, no cache TTL, and Server Actions
used as a data-fetching layer when the RSC already had the data. That last one
is the biggest perceived-speed win available.

**4. `moddex-ws`.** Still an empty scaffold; its CI cannot pass until the
service exists. Nothing depends on it, so it is last.

**5. The artist role.** Blocked, not deferred. Twitch does not expose it on the
public GraphQL surface — `artists`, `channelArtists`, `artistBadge` and
`artistUsers` are all rejected and introspection is disabled. It is assigned
through the broadcaster's Roles Manager, so expect an authenticated,
probably persisted operation. Do not build it until somebody captures that
request.

## Principles worth keeping

- **Contracts before convenience.** `200 []` for an empty role list and never
  404; `ignored` never in a response. Both are pinned by tests because both
  have consumers who cannot be asked to change.
- **The duplication window is the dangerous part of any split.** A fix applied
  to one of two copies is a bug. Phase 1 deliberately created that window and
  phase 2 closed it; do not open another without a plan to close it.
- **Ship the api change before the code that calls it** — except where the
  caller is only adding something the old server ignores, in which case the
  reverse is safer. The rate-limit work was one of those: `moddex-web` started
  sending its internal token *before* `moddex-api` began enforcing limits, so
  there was never a window where the website throttled itself.
