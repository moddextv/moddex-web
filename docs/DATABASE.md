# Database analysis

Measured against a full production copy (MariaDB 10.11.6) imported locally on
2026-08-05: **8,131,260 mods · 5,611,594 vips · 2,751,685 users**, ~1.8 GB after
the phase-1 index fixes.

---

## The headline: is MariaDB the right choice?

**Yes. Keep it.** Not out of inertia — the workload genuinely is not the shape
that a swap would help.

What moddex actually asks the database to do:

| Access pattern                          | Frequency          | Cost today           |
| --------------------------------------- | ------------------ | -------------------- |
| "who holds role R in channel C"         | every channel page | 3.5 ms               |
| "which channels does user U hold R in"  | every user page    | 42 ms                |
| replace a channel's role set on refresh | per scrape         | bulk delete + insert |
| newest snapshot row                     | homepage           | trivial              |

Those are point lookups on an indexed key, returning tens to tens-of-thousands
of rows. There are no aggregations, no scans, no analytical queries. After the
phase-1 index work the worst page in the product resolves in **22 ms** against a
1.8 GB dataset that fits comfortably in RAM on a modest VPS.

### Why not ClickHouse

ClickHouse is a columnar OLAP engine. It wins on analytical scans and
aggregations over enormous tables. It is a poor fit here on three counts:

1. **Point lookups are its weak axis.** It has no equivalent of a clustered
   primary-key seek; the sorting key gets you range pruning, not a 3 ms
   single-key fetch.
2. **The refresh path mutates.** Every scrape replaces a channel's role set.
   ClickHouse mutations (`ALTER … DELETE/UPDATE`) are asynchronous, rewrite
   whole parts, and are explicitly not meant for routine use.
3. **No transactions.** The role refresh needs the delete and the insert to land
   together or not at all — see the partial-write risk below.

**Where ClickHouse would genuinely earn its place:** if you add the role-history
event log described below and later want questions like "how many mod grants per
month across all of Twitch", "what is the median tenure of a moderator", or
"which channels churn moderators fastest". That is an append-only, high-volume,
aggregate-heavy workload — exactly its shape. The right architecture then is
MariaDB as the system of record plus ClickHouse as an analytics sidecar fed from
the event log. **Not a replacement.**

Postgres would be a modest upgrade (better planner, partial indexes, `pg_trgm`
for username search) but the migration cost outweighs it while queries sit in
single-digit milliseconds.

---

## The structural problem: one table per role

`mods` and `vips` are identical tables differing only in name. The role name is
therefore hardcoded in **15 files**, interpolated directly into SQL
(`FROM ${role}`), and duplicated across the fetch layer, the actions, and the
API routes.

Adding **founder** and **artist** doubles that: four tables, four query paths,
four API endpoints, four sets of UI strings — and the SQL interpolation, which
is currently safe only because every caller happens to pass a typed union,
becomes four times as much surface to keep safe.

### Measured comparison

Built the unified table from the real 13.7M rows and compacted both:

|                        | current (`mods` + `vips`)                   | unified (`roles`)     |
| ---------------------- | ------------------------------------------- | --------------------- |
| Channel page, 2 roles  | 3.48 ms + 0.61 ms = **4.09 ms** (2 queries) | **4.22 ms** (1 query) |
| On disk                | 988 MB                                      | 947 MB                |
| Round trips at 4 roles | 4                                           | 1                     |

**Performance is a wash at two roles and better at four.** Disk is 4% smaller —
the `BIGINT` saving is mostly eaten by the extra role byte in the primary key.
So this is not a performance change; it is a change that stops the schema
multiplying every time you add a role. That is the whole argument, and it is
enough.

---

## Findings, in severity order

### 1. `granted` silently rewrites itself — data-loss landmine

```sql
`granted` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
```

Any `UPDATE` to a role row replaces the historical grant date with _now_. That
date is the single thing moddex has which Twitch does not expose. The current
code happens to delete-and-reinsert rather than update, so it has not fired —
but it is one `UPDATE` away from quietly destroying the product's core data,
with no error and no way to recover it.

Fixed in the new schema by simply not carrying the clause.

### 2. Losing a role erases that it ever existed

`getAndStoreUsers` does `DELETE FROM <role> WHERE channel_id=?` then re-inserts
whatever Twitch currently returns. So when someone is unmodded, their row
vanishes. There is no "was a mod from 2015 to 2020", and no way to ever
reconstruct it.

For a product that describes itself as a permanent record, this is the biggest
structural gap in the schema. The new table adds a nullable `revoked` column:
a refresh becomes a **diff** (mark missing roles revoked, insert new ones)
rather than a wipe, which also:

- enables a genuine feature — _former_ mods, role tenure, "modded 4 channels,
  lost 1"
- removes the partial-write risk: today a failure mid-refresh leaves the channel
  with an incomplete list **and** a fresh `updated` timestamp, so it looks
  correctly cached
- turns thousands of row-at-a-time inserts into a small delta

### 3. Numeric ids stored as `varchar(20)`

Every id is numeric, ≤10 digits, max observed 1,472,458,407. As text they cost
~11 bytes instead of 8, sort incorrectly (`'9' > '10'`), and every secondary
index carries them via the primary key. `BIGINT UNSIGNED` is the correct type.

(`INT UNSIGNED` would fit today at 4 bytes, but Twitch ids are already a third
of the way to its 4.29e9 ceiling — not worth the cliff.)

### 4. The audit trail has never worked

`audit.id` has no `AUTO_INCREMENT` while the app inserts `(type, message)`
without an id. The table has **0 rows** in production — every top-donator change
since launch went unrecorded. Fixed in migration 001.

### 5. Smaller items

- `chat_badges.slug` exists in production and is never read or written.
- `dctwitchusers.twitch_id` is joined on but was unindexed (fixed in 001).
- Tables are `utf8mb3`; `login` is ASCII-only by Twitch's rules and could be
  `CHARACTER SET ascii` for a smaller index.
- `users.updated` means "when we last scraped this account's role lists" —
  worth renaming to `roles_synced_at`, since `users` legitimately holds both
  people and channels and the ambiguity has already caused confusion.

---

## The new roles

The registry lives in `src/misc/roles.ts`; a role is one entry there plus one
integer in the database.

| Role        | id  | Colour          | Corner of the mark |
| ----------- | --- | --------------- | ------------------ |
| mod         | 1   | `#4ADE80` green | top-left           |
| vip         | 2   | `#F472B6` pink  | bottom-right       |
| **artist**  | 3   | `#60A5FA` blue  | top-right          |
| **founder** | 4   | `#FBBF24` amber | bottom-left        |

All four are Tailwind `*-400` — the existing two already were, so the family is
consistent rather than arbitrary. Amber for founder reads as "first supporter"
and is the only warm hue in the set, so it never reads as a moderation role.
Four roles also complete the mark: each takes one corner.

**Artist is buildable now.** The `GqlRoleData` interface in
`utils/api/twitch/gql.ts` already declares an `artists` connection next to
`mods`/`vips`, so it fetches through the same paginated path.

**Founder needs verification first.** No `founders` connection appears in the
GraphQL shape the code already models, and on Twitch a founder is a _subscriber_
badge — one of a channel's first subscribers — rather than a channel role. It
may not be exposed on the user type at all. The schema does not care: `founder`
is just id 4 whenever a source is confirmed. Do not build the fetch path until
someone has run the query.

---

## Migration order

| File                            | What                                                              | Risk                                |
| ------------------------------- | ----------------------------------------------------------------- | ----------------------------------- |
| `001-indexes-and-audit-fix.sql` | audit AUTO_INCREMENT, drop redundant indexes, widen channel index | low, ~10s per table, `INPLACE`      |
| `002-unified-roles.sql`         | build `roles`, copy 13.7M rows                                    | **~13 min**, needs a window         |
| `003` (not written)             | convert `users.id` to BIGINT, add FKs, drop `mods`/`vips`         | only after the app is switched over |

001 is already applied to the local production copy and measured: the channel
query went **1253 ms → 22 ms** and the database shrank 340 MB.
