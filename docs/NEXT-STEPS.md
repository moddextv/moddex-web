# Next steps

What is outstanding, in the order I would do it. Companion to
[`REBUILD-PLAN.md`](REBUILD-PLAN.md) (the roadmap and its reasoning) and
[`DATABASE.md`](DATABASE.md) (the measured schema analysis).
Deployment is in [`DEPLOY.md`](DEPLOY.md), database transfer in
[`RESTORE.md`](RESTORE.md).

Everything below is *not done*. What is already done and verified is in the
other two documents.

---

## 1. Blocking — nothing ships until these happen

These are yours, not code. The rebrand is inert without them.

- [x] **Register `moddex.tv`.** Done.
- [x] **Add the OAuth redirect URL** in the Twitch developer console. Done —
      `https://moddex.tv/api/auth/callback/twitch` and
      `http://localhost:5099/api/auth/callback/twitch`. The local one matches
      `APP_PORT=5099`; if that port ever changes, the redirect must change with
      it or local login breaks.
- [x] **Rotate every secret.** **Done, and verified on the server 2026-08-07**
      by hashing each value in `/srv/moddex.tv/.env` and
      `/srv/api.moddex.tv/.env` and comparing against the prepared set:
      `AUTH_SECRET`, `AUTH_TWITCH_SECRET`, `STRIPE_SECRET_KEY` and
      `STRIPE_WEBHOOK_SECRET` all match, so production is running rotated
      credentials.

      `DB_PASS`/`DB_ROOT_PASS` were deliberately left alone — see
      `moddex-workspace/SECRETS.md` for why rotating those is an `ALTER USER`
      job rather than an `.env` edit.

      Still outstanding on the Stripe side: **the old `sk_live_` key has not
      been revoked.** Two live keys can coexist, which is what made the
      rotation zero-downtime, but the old one keeps working until you revoke
      it in the dashboard. Do that after a real donation confirms the new key.

      The history below is kept because it is why this took two passes:
      Checked on the server 2026-08-06 by diffing
      `/home/dev/modchecker.com/.env` (Aug 2026) against `.env.local` (May 2025):
      `AUTH_SECRET`, `DB_USER` and `DB_PASS` were rotated, but
      `AUTH_TWITCH_ID`, `AUTH_TWITCH_SECRET`, `AUTH_TWITCH_CLIENT_ID`,
      `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_PUBLISHABLE_SECRET_KEY` and
      `STRIPE_DONATION_PRICE` are byte-identical across both — never rotated.
      `STRIPE_SECRET_KEY` is an `sk_live_` key. Rotating it touches live
      payments and must be coordinated with the Stripe dashboard.
- [x] **Set repo/CI values:** `IMAGE=ghcr.io/<owner>/<repo>` in the server
      `.env`, and a `NEXT_PUBLIC_PUBLISHABLE_SECRET_KEY` repo secret — without
      it the CI build ships an undefined Stripe key to the browser.
      **`NEXT_PUBLIC_PUBLISHABLE_SECRET_KEY` confirmed set on 2026-08-06**
      (`gh api .../actions/secrets` reports 1 secret). `IMAGE=ghcr.io/<owner>/<repo>`
      in the *server* `.env` is still outstanding — that one is not a repo
      secret and cannot be checked from here.
- [x] **Confirm the reverse proxy.** **Resolved — it is Caddy, in docker.**
      Lives in `/srv/caddy/` (`Caddyfile` + `compose.yaml`), terminates TLS for
      every hostname over ACME, and reaches each service by container name on
      the external `web` network exactly as `compose.prod.yaml` assumed. Host
      nginx is retired; `switchover.sh` in that directory is the one-time
      migration that did it, not a deploy script.

      One trap recorded in the Caddyfile and worth repeating: moddex-web's
      compose project is named `moddex`, so the container is `moddex-app-1`,
      **not** `moddex-web-app-1`. Guessing it from the repo name gives a silent
      502.

      The two-part-migration note below was right, and both parts are now done.
- [x] **DNS and the status page — done.** Verified 2026-08-07: `moddex.tv`,
      `www.`, `api.`, `status.` and `ws.` all resolve to `152.53.3.167`
      (and `2001:1700:a00::14`), and `moddex.tv`, `api.moddex.tv` and
      `status.moddex.tv` each answer `200` on `/health` over https.

      **Two pieces are not done.** The FrankerFaceZ add-on has not been
      verified against the new domain — it reads `/v1/chatBadges`, so check it
      resolves badge images from `api.moddex.tv` and not the old host.
      And `modchecker.com` still resolves to `162.255.119.167`, a different
      server entirely, so it is neither redirecting here nor serving the app.
      Decide whether to point it at this host with a permanent redirect or let
      it lapse.

## 1b. Deployment ordering — read before shipping

**Apply `001` to production *before* deploying the current code.** They are
coupled, and getting the order wrong breaks donations:

`audit`.`id` has no `AUTO_INCREMENT` in production, so
`INSERT INTO audit (type, message)` fails. Under the *old* `db.query` that
error was swallowed and returned `[]`, which is why the table sat at 0 rows
silently. `db.query` now throws, so that same failure propagates out of
`storeDonation`, the webhook returns 500, and stripe retries. The donation row
itself is already committed by then, so a retry hits the idempotency check and
resolves — but the badge and audit write are skipped, and it is noise you do
not want on live payments.

`001` gives `audit`.`id` its `AUTO_INCREMENT` and the problem disappears.
Fresh installs are unaffected: `db/init/01-schema.sql` already has it.

Order: **apply 001 → deploy code → set `STRIPE_WEBHOOK_SECRET` → apply 005.**
(005 last so the corrected code is what handles the next donation; applying it
earlier works but the next donation would re-corrupt it.)

## 2. Security — small, isolated, should not wait

- [x] **Stripe webhook.** **Done** — `POST /api/stripe/webhook` verifies the
      signature and is now the source of truth; `/donate/success` is read-only.
      Handles `checkout.session.completed` and
      `checkout.session.async_payment_succeeded`, ignores anything not `paid`,
      and is idempotent on `payment_id`. Status codes are deliberate, because
      stripe retries any non-2xx for ~3 days: 400 for a bad signature (never
      retry), 500 when we fail to record a real payment (please retry), 200
      for handled *and* for deliberately ignored events.
      `donationExists` no longer swallows database errors — it used to return
      "no such donation" when the *check* failed, which under retries is how
      one payment becomes two rows and two badges.
      **Still needs you:** add the endpoint in the Stripe dashboard and set
      `STRIPE_WEBHOOK_SECRET`. Until it is set the route refuses with a 500 and
      logs why, rather than trusting unsigned traffic.

- [x] **The top donator badge has never worked.** Confirmed on the
      2026-08-06 dump: **26 accounts held a badge the donate page calls
      "one-of-a-kind"**, and the actual top donor ($25.00) held nothing.

      Cause: the mariadb driver returns `SUM()` as a DECIMAL *string*, so
      `userTotalAmount > topDonator.total` compared strings —
      `"500" > "2500"` is `true` because `'5' > '2'`. Every $5 donor "beat" the
      real top. The revoke step then removed the badge from whoever was top
      *by total*, who for the same reason never held it, so the revoke was a
      no-op and holders accumulated.

      A second bug sat underneath: the donation is inserted before the check,
      so a genuine new top donor's total *equals* the max and `>` could never
      fire even with correct numeric types.

      Fixed in `src/utils/donation.ts` (numeric coercion, identity test against
      the recomputed top, and a sweep that revokes from *all* other holders so
      it is self-healing). `db/migrations/005-repair-top-donator-badge.sql`
      redistributes the existing data — rehearsed on the production copy:
      26 holders → 1, the correct $25.00 donor. Rerun-safe.
- [x] **Rate limiting.** **Done 2026-08-07**, in `moddex-api`
      (`src/http/rateLimit.ts`). Per-IP fixed window, hand-rolled rather than
      `express-rate-limit` so the lockfile is untouched — see §7 on why adding
      a dependency from Windows is a build failure waiting for CI.

      Two budgets: `RATE_LIMIT_MAX` (120/min) for the public surface, and
      `RATE_LIMIT_SCRAPE_MAX` (20/min) for `/v1/mods|vips|founders` asked by
      **channel**, the only direction that can fan out to twitch. `?user=`
      reads stored rows and stays on the wider budget.

      Three things it deliberately does not limit: `/health` (status.moddex.tv
      polls it, and a throttled monitor reports a fake outage), the stripe
      webhook (signature-verified, and stripe picks its own delivery rate), and
      any caller holding `INTERNAL_API_TOKEN`.

      **That last exemption is load-bearing.** moddex-web renders every page
      through the api, so all of moddex.tv's traffic arrives from one address
      and would have been the first thing throttled. `moddex-web`'s api client
      now sends the token on *every* call, not just the guarded ones.

      Also fixed alongside: `trust proxy` was `true`, which makes express take
      the leftmost `X-Forwarded-For` entry — client-supplied, so anyone could
      mint unlimited buckets and walk straight through the limiter. It counts
      one hop now (Caddy). Raise it if a proxy is ever added in front.

      **Deploy moddex-web first, then moddex-api** — the reverse of the usual
      order in `CLAUDE.md`, and deliberately so. moddex-web is only adding a
      header that the current api ignores, whereas shipping the api first
      leaves a window where the website is throttled at 120 req/min.
- [x] **An authorisation helper**, so the next server action added does not have
      to remember the `auth()` dance by hand. **Done** — `src/utils/authz.ts`
      exports `requireUserId()` and `requirePermission(level)`. Both throw
      (`NotAuthenticatedError` / `NotAuthorisedError`) rather than returning
      null, because an action that ignores a returned value still runs its
      mutation. `setIgnoredUser` and `setSelectedUserChatBadge` now use it.
      The dashboard page deliberately still calls `auth()` directly: it renders
      `<Login/>`/`<Forbidden/>`, and a page should render, not throw.
      Caveat recorded in the helper: `perms` comes from the jwt token, so it is
      only as fresh as the session — do not gate instant-revocation on it.

## 3. Database — the migration path

Detail and measurements in [`DATABASE.md`](DATABASE.md).

- [x] **Apply `001-indexes-and-audit-fix.sql`** to production. **Confirmed
      applied 2026-08-07** by inspecting production directly: `audit`.`id` has
      its `AUTO_INCREMENT` and the `granted` indexes are present. The rehearsal
      notes below are kept for the measurements. Low risk,
      `INPLACE`. **Rehearsed 2026-08-06** on a full restore of the
      2026-08-06 dump (8.1M mods, 5.6M vips, 2.75M users) in the dev container:
      applied clean in **47 s** total.

      Verified:
      - **Database 2202 MB → 1796 MB, i.e. 406 MB saved** — beats the 340 MB
        estimate. Index bytes: mods 472→231, vips 327→162, user_badges 26→14.
      - **The audit fix works.** Two inserts before it collided on id=0; after
        it they get ids 1 and 2. That is the donation trail unblocked.

      Not reproduced — **the "1253 ms → 22 ms" claim.** Measured on the isolated
      role lookup with a warm buffer pool, the old narrow `(channel_id)` index
      and the new covering `(channel_id, granted)` index are indistinguishable:
      **10.9 ms vs 12.0 ms**. The query the application actually runs
      (`getStoredUsers`, with the users and user_badges joins) went **3.48 s →
      2.82 s, about 19 %**. Caveats: this is a Docker Desktop VM on an Intel
      iMac, not production's aarch64 Debian, and 1253 ms is consistent with a
      cold-cache measurement where the covering index avoids disk. Treat 001 as
      worth applying for the disk, the write cost and the audit fix — but do
      not expect the channel page to get 57x faster.

      The channel page's real cost is the join fan-out, not the role index:
      role lookup alone is ~4-12 ms, adding the `users` join takes it to
      **1.83 s**, and the badge join to **2.20 s**. That is §6 territory.
- [x] **Apply `002-unified-roles.sql`** — **done 2026-08-07**, together with the
      data-layer switch, which is the only order that works. Ran detached under
      `nohup` on the host (not over ssh, which is how the rehearsal died):
      **10:31:47 → 11:24:09 UTC, 52m22s, exit 0.**

      Verified **per role**, which is the check that catches a half-migration:

      | role | rows | source |
      |---|---|---|
      | 1 (mod) | 8,131,260 | `mods` 8,131,260 ✅ |
      | 2 (vip) | 5,611,594 | `vips` 5,611,594 ✅ |
      | 4 (founder) | — | `founders` was empty ✅ |

      The site stayed up throughout — `002` is additive and the running code
      still read `mods`/`vips`, so all endpoints answered 200 the whole time.

      Two notes for whoever does `003`. The `vips` pass took **longer than the
      larger `mods` pass** (34 min against 18) because the primary key is
      `(user_id, channel_id, role)`, so inserts land at random points in a
      B-tree that keeps growing — expect the same shape again. And do **not**
      run `COUNT(*)` on `roles` for progress while it is inserting; it is an
      InnoDB full scan against a table under bulk write and it simply hangs.
      Read `information_schema.PROCESSLIST` instead.

      The window between the migration finishing and the new code deploying
      would have left any channel scraped in between missing from `roles`.
      Checked afterwards: **zero channels were scraped in that window**, so no
      reconciliation was needed. Worth re-checking if this is ever repeated.

      `DROP TABLE mods` / `DROP TABLE vips` are still commented out in `002`, on
      purpose — leave them until this has been watched for a while.

      The original reasoning, kept because it is why this waited:

      `002` is a **one-shot backfill**. It copies `mods` and `vips` into
      `roles` and installs no dual-write and no trigger. The application keeps
      writing only to `mods`/`vips` — `storeUsers` does DELETE-all +
      INSERT-all per channel refresh — so `roles` begins going stale the
      moment the next channel is scraped. And it cannot be topped up later:
      the primary key is `(user_id, channel_id, role)`, so a second pass
      collides on duplicates.

      Applying it now therefore buys nothing and costs something — a table
      nothing reads, wrong by an unknown amount, expensive to redo.

      **Run it adjacent to the data-layer switch below, in the same window.**
      Order: switch the code to read and write `roles` → apply `002` →
      verify per role → deploy → only then uncomment the `DROP TABLE`s.

      **Rehearsal 2026-08-06 — the ~13 minute estimate did not hold.** On the
      production copy the `mods` pass alone (8.1M rows) took over 20 minutes,
      and the run then died part-way through `vips`:

          ERROR 2026 (HY000): TLS/SSL error: unexpected eof while reading

      The client connection was dropped, not the server. The `mods` INSERT had
      committed; the `vips` INSERT rolled back whole, leaving `roles` with
      role 1 populated and role 2 empty — a partial state that looks plausible
      until you count per role.

      Two things follow. **Run it on a connection that cannot be interrupted**
      — detached inside the container, or under screen/tmux on the server, not
      over an ssh session or a backgrounded exec. And **verify per role, not in
      total**, because `COUNT(*)` on a half-migrated table still returns a big
      believable number:

          SELECT role, COUNT(*) FROM roles GROUP BY role;

      It is NOT rerunnable after a partial failure: the primary key is
      (user_id, channel_id, role), so repeating a committed pass fails on
      duplicates. Resume by running only the statements that did not complete.

      Budget well over 30 minutes. Original note follows: ~13 minutes
      on 13.7M rows. Take a backup first. It is additive — `mods` and `vips`
      stay until the app is switched over.
- [x] **Switch the data layer to `roles`** — **done 2026-08-07**, deployed as
      `moddex-api` rev `5216cf4`. It was 4 files, not 6, and the registry work
      was already done: `src/misc/roles.ts` carried the ids `002` keys on.

      The role name no longer reaches the query text. It was interpolated as a
      table name (`JOIN ${role}`) in five statements; it resolves through
      `roleIdByLabel()` to an integer and travels as a bound parameter.

      Reads gained `revoked IS NULL` — load-bearing now that rows are stamped
      rather than deleted, or every channel someone was *ever* modded in comes
      back as current.

      `storeUsers` became a diff instead of a rewrite, which also closes the
      "row-at-a-time inserts" item in §6 below: it was `DELETE FROM <role>` plus
      one INSERT per user in a loop, 14,001 sequential round trips on the
      largest channel. It now stamps the set revoked and re-inserts current
      holders, chunked 500 rows per statement, inside a transaction — which
      needed a new `db.transaction()`, since `query()` takes a fresh connection
      per call and the revoke/reinstate pair could not otherwise be atomic.
- [ ] **Write `003`**: convert `users.id` to `BIGINT UNSIGNED`, add the foreign
      keys 002 had to defer, drop `mods`/`vips`. Only after the app is live on
      `roles`.
- [x] **Apply `004-rebrand-chat-badge-labels.sql`.** **Confirmed applied
      2026-08-07** — no `chat_badges.name` in production begins "Modchecker"
      any more. Instant, 7 rows. The original note: production values read
      `"Modchecker ..."` — they
      are *data*, so the code rebrand does not touch them and the old brand is
      still rendered next to users' names. `slug` is deliberately left alone: it
      is the key the app and the FFZ add-on match on.
- [x] **Migrate production data into the container volume.** Done — the volume
      owned by `moddex-api`'s compose project holds the live data (2.7M users,
      8.1M mods, 5.6M vips) and the nightly dump runs beside it. The host MySQL
      still exists with the pre-split copy; see DEPLOY.md for retiring it.
- [x] **The missing companion docs.** **Half of this was wrong.**
      `DATABASE.md` exists and always did — 8 KB of measurements against the
      production copy, including the row counts and the disk analysis. Only
      `REBUILD-PLAN.md` was absent, and it was absent from git history too, so
      there was nothing to restore.

      Written fresh 2026-08-07 as a reconstruction rather than a recovery, and
      it says so at the top. It records the roadmap as it actually stands and
      quotes only numbers that have a source in `DATABASE.md` or in a rehearsal
      recorded here.

## 4. The new roles

Both entries below were **backwards**. Verified against `gql.twitch.tv`
on 2026-08-06 with the app's own client-id; `user.mods` was used as a control
and returned data, so the probe is sound.

- [x] **Founder — BUILT.** Verified end to end against a live channel: 24 rows
      fetched, stored and served with real `entitlementStart` dates.

      `fetchFounders(login)` in `utils/api/twitch/gql.ts` (its own path, not
      `fetchRoles`), `getChannelFounders`/`getUserFounders`, a `founders` table
      via `006`, `GET /api/v1/founders`, and a third `UserList` on the channel
      page. `002` extended so it folds into `roles` as role 4 when applied.

      `isSubscribed` is deliberately **not** stored: what is recorded is when
      the role was granted, which is permanent, not whether the badge is
      currently displayed.

      `founders.granted` has no `ON UPDATE current_timestamp()`, unlike
      `mods`/`vips` — that clause rewrites the historical date on any UPDATE,
      which would destroy the only thing this role is for.

      `fetchRoles` is now typed `PaginatedChannelRole` (`'mods' | 'vips'`), so
      routing a non-connection role through it is a compile error rather than a
      silently empty list.

      Note twitch returned 25 entries and 24 were stored: one has `user: null`,
      a deleted account, which is filtered.

      ```graphql
      query { channel(name: "<login>") {
        founderBadgeAvailability
        founders { entitlementStart isSubscribed
                   user { id login displayName chatColor
                          profileImageURL(width: 600) } } } }
      ```

- [ ] **Artist — not on the public surface, but obtainable.** roles.tv publishes
      **2,197,197 artists**, so a source exists; the finding below is about the
      endpoint tried, not about twitch. The cheap move is to ask them. Failing
      that, capture the Roles Manager request from a broadcaster session.

      `Cannot query field "artists" on type "User"`,
      and the same on `Channel`. `channelArtists`, `artistBadge` and
      `artistUsers` are all rejected; introspection is disabled so the real
      name cannot be enumerated from outside.

      The previous claim that `GqlRoleData` "already declares an `artists`
      connection next to `mods`/`vips`" was false. It declared one as a
      **sibling of `user`**, not a field on it — `fetchRoles` reads
      `data.user[role]`, so building on that would have produced a role that is
      permanently empty with no error raised. That declaration is now removed.

      Twitch's artist badge is assigned through the broadcaster's Roles
      Manager, so expect an authenticated, probably persisted/hashed operation
      rather than a public connection. Do not build it until someone captures
      that request.

## 4b. Ideas from roles.tv (scanned 2026-08-06)

Their `/stats` page tracks ten categories; moddex tracks two. What is worth
taking, cheapest first:

- [ ] **Persist `isPartner` / `isAffiliate` / `isStaff`.** Every gql role query
      already fetches these for every user, `utils/user.ts` reads them to award
      badges, and then they are thrown away — the `users` table has no column
      for them. Storing three booleans unlocks global counts and "partners only"
      filters on a list, with no new api calls at all. Cheapest win available.
- [ ] **A `/stats` page.** The homepage shows four numbers from `snapshots`;
      roles.tv gives ten their own page. `snapshots` already has 2,014 rows of
      history, so a chart over time is available for free and is something they
      do *not* appear to do.
- [x] **Flag known bots.** Done — `users`.`bot` is populated from the curated
      list in `misc/bots.ts`, re-evaluated on every write so adding a name takes
      effect as users refresh, and moddex-web has a "hide bots" filter. They
      curate 19. Bots dominate large mod lists
      (`fossabot` and `susgeebot` are already in our data), so a flag — or a
      "hide bots" toggle — makes a 14,000-entry mod list considerably more
      readable.
- ~~**Subscribers**~~ — **dropped 2026-08-07, by decision.** Not a backlog
      item: it is not public data the way mods and vips are, and it is not
      going to be built. Removed so it stops reading as something pending.

Not worth copying: their site is a client-rendered SPA with an empty document,
so it has no SEO surface at all. moddex renders on the server, which is the more
valuable position for a lookup tool people find by searching a username.

## 5. Correctness — carried over, still true

- [x] `db.query` swallows every error, so callers cannot tell failure from an
      empty result. **Fixed** — it logs and rethrows. `queryOne` returning
      `false` now means "no such row" and nothing else. Note this is a
      behaviour change: a database outage that used to render as an empty list
      or a homepage of zeroes now surfaces as an error.
- [x] `getStats` dereferences a possible `false`. **Fixed.** The "same in a few
      other readers" part turned out not to hold: every other `queryOne` caller
      already guards (`if (!badge)`, `tokenData && …`, `?.total || 0`,
      `?.badge_name || 'none'`). `getStats` was the only unguarded one.
- [x] Dead 404 branches in `/api/v1/mods` and `/api/v1/vips` — `filterUsers`
      always returns an array, so the intended empty-result 404 never fires and
      those paths return `200 []`. **Removed, 8 branches across the two files.**
      Behaviour deliberately unchanged: `200 []` has always been the de facto
      contract, and switching to 404 would break the FFZ add-on and any
      existing api consumer. See the open contract question in §7.
- [x] `splitArray` mutates its input (`splice` in a loop). **Fixed** with
      `slice`. `getUsersFromHelix` was already working around it by passing
      `[...usernames]`; that copy is now redundant but harmless. The old
      version also looped forever on `chunkSize <= 0`, which now throws.
- [x] **`User.granted` is typed `string | null` but carries a `Date`.**
      **Fixed** — the type is now `string | Date | null` on both `User` and
      `UserBadgeRow`, which is what the mariadb driver and the gql path
      actually produce between them.

- [x] **`fetchUsersById` looked users up by login.** `fetchUsers` defaults to
      `type: 'login'` and `fetchUsersById` never passed `'id'`, so it queried
      `user(login: "28005230")` and matched nothing. `getUsers()` therefore
      never created users it had not already seen, and `storeUsers()` then died
      on the foreign key. Invisible in production — `users` already holds 2.75M
      rows, so nearly every mod or vip is already present — but every genuinely
      new user was dropped, and on a fresh database nothing stored at all.
      Found while testing founders on a seeded database, where it failed 100%.

## 6. Performance — app-side, not database-side

The database is fine (see `DATABASE.md`). These are the real bottlenecks.

- [x] **N+1 in `getUsers`** — a badge query per user in a loop. **Done
      2026-08-07** in `moddex-api/src/utils/user.ts`: the loop is gone, not
      batched, because every one of those queries was wasted twice over.
      `getUsersFromDbById` already LEFT JOINs the badges and `formatUsers` has
      already populated them — the loop refetched what was in hand and
      *downgraded* it, overwriting the join's `{id, name, path}` with
      `getUserBadges`'s `{name, path}`. And the only caller passing more than
      one id (`utils/roles/channel.ts`, which calls `getUsers` purely to create
      users it has not seen) throws the return value away.

      No response shape changes: `/v1/users` builds from
      `getUsersFromDb`/`getUsersFromDbById` and never goes through `getUsers`.
      Verified by reading the call graph — **the integration suite was not run**
      (it needs a running stack; docker was down on the machine that made this
      change). Run `npm run test:integration` before deploying.

      Still open next door, and bigger on a cold channel: `updateUserInDb` runs
      four queries per user after the insert, and `channel.ts` discards those
      results too. On a channel whose 14,000 mods are all new that is ~56,000
      queries computing a value nobody reads. That is the "row-at-a-time
      inserts" item below.
- [x] **Row-at-a-time inserts in `storeUsers`** — **done 2026-08-07**, as part
      of the `roles` switch in §3. Batched 500 rows per statement, wrapped in a
      transaction, and using `revoked` so a refresh is a diff rather than a full
      rewrite — exactly as this entry predicted.
- [ ] **No cache TTL.** A channel scraped once is frozen forever unless someone
      clicks reload.
- [ ] **Server Actions used as a data-fetching layer.** Every profile page
      hydrates, then round-trips for data the server already had. Fetch in the
      RSC and stream with `<Suspense>`; keep an action only for explicit reload.
      Biggest perceived-speed win available.

## 7. Tests

**Started 2026-08-06.** 25 tests: 15 unit (`npm test`) and 10 integration
(`npm run test:integration`, needs a running stack).

- [x] Vitest. Two configs: `vitest.config.ts` (unit, node only, runnable in CI
      with no stack) and `vitest.integration.config.ts` (hits a running app over
      http). A dedicated `compose.test.yaml` database is still outstanding —
      integration currently runs against the dev stack.
- [x] Unit: `splitArray` (no-mutation + the chunkSize<=0 hang),
      `formatNumberShort`, `formatNumber`, `formatDate`, `isInteger`.
      Writing them found a bug: `isInteger(null)` was `true`, because
      `Number(null)` is 0. `formatUsers` and badge permission resolution are
      still uncovered — both need a database, so they belong with the
      integration set.
- [x] Integration against the seed: the `/api/v1` routes, opt-out filtering,
      and the 200-[]-vs-404 contract — now pinned down by a test rather than
      left as an open question. `ignored` is asserted never to appear in an api
      response, since leaking it would expose who has opted out.
- [ ] Regression tests for the server-action authorisation fixes.
- [ ] Mock the Twitch/ivr clients at the module boundary; never hit them in CI.
- [ ] **Guard the lockfile.** `npm install` on Windows silently drops
      Linux-only optional deps and breaks the Docker build. CI runs `npm ci`,
      which will now fail loudly — keep it that way.

## 8. Design — open threads

**Parked 2026-08-07.** None of the below is blocking anything; revisit when
there is a reason to. Left in place rather than deleted because they are real,
just not now.

- [ ] The logo is in and the design derives from it. The remaining gap is the
      **light theme**, which was retuned to match but has only been exercised in
      dark.
- [ ] `public/files/logo.ai` still holds the *old* wordmark artwork. The lockup
      SVGs reference Cairo 700 as a live font — outline the wordmark before
      shipping them anywhere the font is not guaranteed (see
      `public/logo/README.md`).
- [ ] Decide whether the donation flow survives the reset at all. It carries a
      Stripe dependency, a legal surface and a whole badge subsystem.
