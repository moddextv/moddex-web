# Next steps

What is outstanding, in the order I would do it. Companion to
[`REBUILD-PLAN.md`](REBUILD-PLAN.md) (the roadmap and its reasoning) and
[`DATABASE.md`](DATABASE.md) (the measured schema analysis).

Everything below is *not done*. What is already done and verified is in the
other two documents.

---

## 1. Blocking — nothing ships until these happen

These are yours, not code. The rebrand is inert without them.

- [ ] **Register `moddex.tv`.** Verified unregistered at the registry on
      2026-08-05, but confirm the price — `.tv` has premium tiers.
- [ ] **Add the OAuth redirect URL** in the Twitch developer console.
      **Login is dead until this is done.**
- [ ] **Rotate every secret.** `AUTH_SECRET`, the Twitch client secret and the
      Stripe key have all sat in a plaintext `.env.local` through a domain
      change.
- [ ] **Set repo/CI values:** `IMAGE=ghcr.io/<owner>/<repo>` in the server
      `.env`, and a `NEXT_PUBLIC_PUBLISHABLE_SECRET_KEY` repo secret — without
      it the CI build ships an undefined Stripe key to the browser.
- [ ] **Confirm the reverse proxy.** `compose.prod.yaml` assumes one already
      terminates TLS on an external Docker network named `web`. If there isn't
      one, Caddy needs to join the compose file.
- [ ] Repoint DNS, the status page, the FrankerFaceZ add-on and the Discord bot
      at the new domain. Keep `modchecker.com` redirecting if it is still yours.

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
- [ ] **Migrate production data into the container volume**, now that the DB is
      containerised in production too. Dump → restore → verify row counts → cut
      over.

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

- [ ] `db.query` swallows every error, so callers cannot tell failure from an
      empty result. This is the root cause of the next item.
- [ ] `getStats` dereferences a possible `false`; same in a few other readers.
- [ ] Dead 404 branches in `/api/v1/mods` and `/api/v1/vips` — `filterUsers`
      always returns an array, so the intended empty-result 404 never fires and
      those paths return `200 []`.
- [ ] `splitArray` mutates its input (`splice` in a loop).
- [ ] **`User.granted` is typed `string | null` but carries a `Date`.** This bit
      once already: a formatter called `.slice()` on it and took the channel
      page down. The old code hid it by funnelling everything through
      `new Date()`.

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
