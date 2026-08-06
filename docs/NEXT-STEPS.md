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
- [ ] **Set repo/CI values:** `IMAGE=ghcr.io/<owner>/<repo>` in the server
      `.env`, and a `NEXT_PUBLIC_PUBLISHABLE_SECRET_KEY` repo secret — without
      it the CI build ships an undefined Stripe key to the browser.
      **Verified still outstanding on 2026-08-06:** the repo has *zero* Actions
      secrets, so the `build-args` line in `.github/workflows/build.yml:61`
      currently expands to an empty string. Runtime Stripe is fine; it is only
      the build-time publishable key that is missing.
- [ ] **Confirm the reverse proxy.** `compose.prod.yaml` assumes one already
      terminates TLS on an external Docker network named `web`. If there isn't
      one, Caddy needs to join the compose file.
- [ ] Repoint DNS, the status page and the FrankerFaceZ add-on at the new
      domain. Keep `modchecker.com` redirecting if it is still yours.

## 2. Security — small, isolated, should not wait

- [ ] **Stripe webhook.** Donations are only recorded if the browser reaches
      `/donate/success`. Close the tab after paying and the money arrives with
      no row and no badge. A page *render* also performs the write, which is the
      wrong place for it. `POST /api/stripe/webhook` with signature verification
      becomes the source of truth; the success page goes read-only.
- [ ] **Rate limiting.** The public API is unauthenticated and some paths
      trigger outbound Twitch scraping. One client can drive your GQL volume up
      and get the app's client-ID throttled.
- [ ] **An authorisation helper**, so the next server action added does not have
      to remember the `auth()` dance by hand.

## 3. Database — the migration path

Detail and measurements in [`DATABASE.md`](DATABASE.md).

- [ ] **Apply `001-indexes-and-audit-fix.sql`** to production. Low risk, ~10s
      per table, `INPLACE`. Fixes the audit table (0 rows in production — the
      donation trail has never recorded anything) and takes the channel query
      from **1253 ms to 22 ms** while shrinking the database 340 MB.
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
