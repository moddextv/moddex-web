# Next steps

What is outstanding, in the order I would do it. Companion to
[`REBUILD-PLAN.md`](REBUILD-PLAN.md) (the roadmap and its reasoning) and
[`DATABASE.md`](DATABASE.md) (the measured schema analysis).

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
- [x] **Rotate every secret.** Done.
- [x] **Set repo/CI values:** `IMAGE=ghcr.io/<owner>/<repo>` in the server
      `.env`, and a `NEXT_PUBLIC_PUBLISHABLE_SECRET_KEY` repo secret — without
      it the CI build ships an undefined Stripe key to the browser.
      **`NEXT_PUBLIC_PUBLISHABLE_SECRET_KEY` confirmed set on 2026-08-06**
      (`gh api .../actions/secrets` reports 1 secret). `IMAGE=ghcr.io/<owner>/<repo>`
      in the *server* `.env` is still outstanding — that one is not a repo
      secret and cannot be checked from here.
- [ ] **Confirm the reverse proxy.** `compose.prod.yaml` assumes one already
      terminates TLS on an external Docker network named `web`. If there isn't
      one, Caddy needs to join the compose file.
- [ ] Repoint DNS, the status page and the FrankerFaceZ add-on at the new
      domain. Keep `modchecker.com` redirecting if it is still yours.

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
- [ ] **Rate limiting.** The public API is unauthenticated and some paths
      trigger outbound Twitch scraping. One client can drive your GQL volume up
      and get the app's client-ID throttled.
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

- [ ] **Apply `001-indexes-and-audit-fix.sql`** to production. Low risk,
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
- [ ] **Apply `002-unified-roles.sql`** in a maintenance window. **~13 minutes**
      on 13.7M rows. Take a backup first. It is additive — `mods` and `vips`
      stay until the app is switched over.
- [ ] **Switch the data layer to `roles`** (~6 files: `utils/roles/*`,
      `actions/fetchUserListData.ts`, the `/api/v1` role routes,
      `misc/Interfaces.ts`). Drive everything from `src/misc/roles.ts` so the
      role name stops being hardcoded in 15 places and stops being interpolated
      into SQL.
- [ ] **Write `003`**: convert `users.id` to `BIGINT UNSIGNED`, add the foreign
      keys 002 had to defer, drop `mods`/`vips`. Only after the app is live on
      `roles`.
- [ ] **Apply `004-rebrand-chat-badge-labels.sql`.** Instant, 7 rows. All seven
      production `chat_badges.name` values still read `"Modchecker ..."` — they
      are *data*, so the code rebrand does not touch them and the old brand is
      still rendered next to users' names. `slug` is deliberately left alone: it
      is the key the app and the FFZ add-on match on.
- [ ] **Migrate production data into the container volume**, now that the DB is
      containerised in production too. Dump → restore → verify row counts → cut
      over.
- [ ] **Restore the missing companion docs.** `REBUILD-PLAN.md` and
      `DATABASE.md` are linked from the top of this file and from §3, but
      neither exists in `docs/` or anywhere in git history. The §3 measurements
      (1253 ms → 22 ms, −340 MB, ~13 min on 13.7M rows) currently have no
      backing document in the repo.

## 4. The new roles

- [ ] **Artist** is buildable now — `GqlRoleData` already declares an `artists`
      connection next to `mods`/`vips`, so it fetches through the same paginated
      path. Colour `#60A5FA`, top-right corner of the mark.
- [ ] **Founder — verify the source first.** No `founders` connection appears in
      the GraphQL shape the code models, and on Twitch a founder is a
      *subscriber* badge (one of a channel's first subscribers) rather than a
      channel role. It may not exist on the user type at all. The schema does
      not care — it is id 4 whenever a source is confirmed. **Do not build the
      fetch path until someone has run the query.**

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

## 6. Performance — app-side, not database-side

The database is fine (see `DATABASE.md`). These are the real bottlenecks.

- [ ] **N+1 in `getUsers`** — a badge query per user in a loop.
- [ ] **Row-at-a-time inserts in `storeUsers`** — one round trip per mod, on
      channels with tens of thousands of them. Batch it and wrap it in a
      transaction. The `revoked` column from 002 turns this into a small diff
      instead of a full rewrite.
- [ ] **No cache TTL.** A channel scraped once is frozen forever unless someone
      clicks reload.
- [ ] **Server Actions used as a data-fetching layer.** Every profile page
      hydrates, then round-trips for data the server already had. Fetch in the
      RSC and stream with `<Suspense>`; keep an action only for explicit reload.
      Biggest perceived-speed win available.

## 7. Tests — none exist

The disposable seeded database from phase 1 is what makes these cheap.

- [ ] Vitest + a `compose.test.yaml` database.
- [ ] Unit: `formatUsers` (subtle and central), `formatNumberShort`,
      `splitArray`, badge permission resolution.
- [ ] Integration against the seed: the `/api/v1` routes, opt-out filtering,
      and the 404-vs-empty contract once it is decided.
- [ ] Regression tests for the server-action authorisation fixes.
- [ ] Mock the Twitch/ivr clients at the module boundary; never hit them in CI.
- [ ] **Guard the lockfile.** `npm install` on Windows silently drops
      Linux-only optional deps and breaks the Docker build. CI runs `npm ci`,
      which will now fail loudly — keep it that way.

## 8. Design — open threads

- [ ] The logo is in and the design derives from it. The remaining gap is the
      **light theme**, which was retuned to match but has only been exercised in
      dark.
- [ ] `public/files/logo.ai` still holds the *old* wordmark artwork. The lockup
      SVGs reference Cairo 700 as a live font — outline the wordmark before
      shipping them anywhere the font is not guaranteed (see
      `public/logo/README.md`).
- [ ] Decide whether the donation flow survives the reset at all. It carries a
      Stripe dependency, a legal surface and a whole badge subsystem.
