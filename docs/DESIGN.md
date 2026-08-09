# DESIGN.md

The design system as it is actually built, and the only source of truth for it.
This file is what the code does; `/design` renders the live specimen from the
same CSS the site uses, so the two cannot drift.

The static comps this was ported from lived in `design/` and were removed once
this file existed, because a second description of the same system is a second
thing to keep current. They are recoverable: `git show 852fa99` is the last
commit that contains them, and section 1 below carries the part worth keeping.

Read section 1 before proposing a change to how anything looks.

---

## 1. Five directions that were rejected

The current design was arrived at after four rejected attempts. Those verdicts
are constraints, not history: most "obvious improvements" to this interface are
one of the five things already tried and thrown out.

| Attempt      | Verdict                              | Constraint it produced                                                |
| ------------ | ------------------------------------ | --------------------------------------------------------------------- |
| v1 Index     | liked                                | Dark, modern sans, room to breathe                                    |
| v2 Telemetry | "screams AI-generated"               | No dark canvas plus saturated accents plus tracked-out uppercase mono |
| v2 Almanac   | "screams AI-generated"               | No light-weight serif on off-white paper                              |
| v2 Native    | "kind of, not quite"                 | Do not borrow Twitch's identity wholesale                             |
| v3 Records   | "old-fashioned, table-like, clamped" | No Arial, no bordered table grids, no cramped spacing                 |

The three that shape almost every value below:

- **"table-like"** means there is not one `<table>` in this design. A list of
  people is a CSS grid of rows on a shared column template, with hover and
  nothing between rows but air. No borders between cells, no zebra, no boxed
  column-header bar.
- **"clamped"** was the biggest single fix. Row height went 26px to 52px, base
  type 13px to 15px, container 1200px to 1440px, gutters 12px to 32px, panel
  padding 8px to 24px, section gap 16px to 48px. Do not shrink these back.
- **"not quite"** meant the identity was Twitch's rather than moddex's, which is
  where the colour rules in section 3 come from.

---

## 2. Type

Manrope, and nothing else. Geometric enough that it cannot read as
old-fashioned, with enough character in the letterforms not to be Inter by
default, and a real 800 weight for the few display moments.

| token          | size                        | line height | tracking |
| -------------- | --------------------------- | ----------- | -------- |
| `text-micro`   | 12px                        | 1.45        |          |
| `text-meta`    | 13px                        | 1.5         |          |
| `text-ui`      | 14px                        | 1.5         |          |
| `text-base`    | 15px                        | 1.6         |          |
| `text-read`    | 16px                        | 1.65        |          |
| `text-lead`    | 18px                        | 1.6         |          |
| `text-h3`      | 18px                        | 1.35        | -0.01em  |
| `text-h2`      | 22px                        | 1.3         | -0.015em |
| `text-h1`      | 28px                        | 1.25        | -0.02em  |
| `text-display` | clamp(2rem, 3.6vw, 2.75rem) | 1.15        | -0.03em  |

15px base is deliberate. 13px was the rejected size.

**The font is applied through `fontFamily.sans`, not a utility class.** Tailwind
preflight sets `font-family: theme('fontFamily.sans')` on `<html>`, so
overriding that one key gives the whole document a typeface. This matters
because the previous design loaded Lato, exposed it as `--font-lato`, and then
applied it to no element at all: every paragraph on the live site rendered in
the browser default sans for months.

**Manrope is self-hosted and must stay that way.** `next/font/google` downloads
woff2 from fonts.gstatic.com _during `next build`_, which puts a network call
inside the Docker build; under the emulated arm64 half of the cross-build that
call 503'd and killed CI. See `src/app/fonts/README.md`. It is one 24 KB
variable file covering 200 to 800.

---

## 3. Colour

The palette is in `tailwind.config.mjs` under `theme.extend.colors`. Do not add
or retune values.

```
primary  50 #F5F5F7   100 #E7E7EA   200 #D2D2D8   300 #B4B4BC   400 #8A8A93
        500 #55555F   600 #33333A   700 #232326   800 #111113   900 #0B0B0C

mod #4ADE80    vip #F472B6    founder #FBBF24    artist #60A5FA
twitch #714ab8    discord #7289da
```

The chrome is deliberately colourless. Colour is spent on the data.

### Two usage rules, and they are the identity

**Twitch purple is not the accent colour.** It appears filled on at most one
control per page, the sign-in button, and otherwise only as a glyph on a neutral
button. When "Open on Twitch" was a solid purple button it was the brightest
thing on a profile page and pulled focus off the account name, which is the
actual subject. Everything that used to be purple is now neutral or a role
colour.

**`mod` green and `vip` pink carry identity.** Section headings, tab underlines,
the search scope switch, role counts, the affirmative state of the opt-out
switch. They are what replaced purple.

`founder` gold and `artist` blue complete the set. `artist` is declared in
`misc/roles.ts` but is not in `ACTIVE_ROLE_KEYS`, because Twitch does not expose
artists through the public unauthenticated surface. It stays in the palette and
on `/design` so the system already has an answer the day it becomes fetchable.

### Contrast

13px and above needs 4.5:1. **`primary-500` on `primary-800` is 2.6:1 and
fails**; that bug was introduced and fixed three times during this work, so it
is worth stating plainly: anything that is real content uses `primary-400` or
lighter on a panel. `primary-500` is for decoration only.

The comps draw `twitch` as Twitch's own `#9146FF`. The shipped value is
`#714ab8` instead, because white on `#9146FF` is 3.5:1 and fails the rule above
at button size. The demotion of purple is a rule about _where_ it appears, and
that rule is unaffected.

---

## 4. Spacing and shape

```
row height      52px         container   1440px (max-w-page)
gutters         32px         panel pad   24px
section gap     ~48px        nav height  60px
radius          8px default, 6px sm, 12px lg, 9999px pill
```

There is one container, `components/UI/Container.tsx`, and everything wraps in
it so the wordmark, the page heading and the footer share one left edge. Five
routes used to wrap in their own `max-w-3xl` instead, which is why the header
looked detached from the page.

The old design forced `border-radius: 0` on every form control on the reasoning
that the mark has no curves. That rule is gone. The mark having no curves does
not have to dictate button radius.

---

## 5. Components

All in `src/styles/globals.css`, rendered live at `/design`.

| Class                                                                     | What it is                                                                                                                                         |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.panel` / `.panel-flush`                                                 | The one raised surface. 12px radius, 24px padding. `-flush` is for panels whose content is rows, which carry their own padding. Not a card grid.   |
| `.rows` / `.row` / `.row-head`                                            | **Not a table.** A grid on a shared column template, hover, nothing between rows but air. Column labels sit light and unboxed above the first row. |
| `.cols-people` / `.cols-channels`                                         | The two column templates. Both collapse to two columns under 640px by hiding children 3 and up.                                                    |
| `.row-name`                                                               | Underlines on row hover, so a row reads as a link rather than as a selection.                                                                      |
| `.corner` + `-tl` `-br` `-bl` `-tr`                                       | The mark's own notation at UI scale, one orientation per role.                                                                                     |
| `.tabs` / `.tab` / `.tab-mod` / `.tab-vip`                                | The two lookup directions. Underline is the role's colour.                                                                                         |
| `.btn` / `.btn-soft` / `.btn-ghost` / `.btn-twitch` / `.btn-twitch-quiet` | Buttons. `btn-twitch` filled is sign-in only.                                                                                                      |
| `.chip`                                                                   | Filters and sorts.                                                                                                                                 |
| `.toggle`                                                                 | The opt-out switch. Mod green when on.                                                                                                             |
| `.search` / `.scope`                                                      | The nav search and its Channel/Person switch.                                                                                                      |
| `.avatar`                                                                 | Initial-letter fallback where Twitch gives no image.                                                                                               |
| `.skeleton`                                                               | Loading. Column labels stay, only values are blank.                                                                                                |
| `.enter`                                                                  | Section entry, staggered by `--i`.                                                                                                                 |
| `.skip-link`                                                              | First focusable element on the page, targets `#main`.                                                                                              |

Every route's `<main>` carries `id="main"` so the skip link works.

---

## 6. Structure

**The search lives in the nav, on every page.** This is the single most
important structural decision: it is why no page needs a hero, why `/` opens
with a statement instead of a search box, and why `/channel` and `/user` are
destinations rather than search forms. It carries a scope switch marked with the
two corners, so which direction you are searching is stated in the brand's own
notation rather than in a word.

**There is no left rail.** v2 had one. It was the most obviously borrowed
element and it was eating 240px of page width, which was part of "clamped".

**Rows link across the axis.** A moderator listed on a channel page goes to
`/user/<login>`, because the interesting question about them is where else they
moderate. A channel listed on a person's page goes to `/channel/<login>`.

**`/channel` and `/user` are browse surfaces, not search pages.** With the
search in the nav, the route that used to hold nothing but a search box became
the place that lists what the index actually contains. Both read
`api.moddex.tv/v1/channels` and `/v1/accounts`, added for this, and `/` shows
the first five of each.

One caveat worth knowing before wondering why a list is empty: the "most roles"
orderings read a rollup table (`role_counts`) that moddex-api rebuilds once a
day, because ranking 2.75M accounts by role count is an aggregate over 13.7M
rows and this schema is deliberately not built for aggregates. Until the first
rebuild has run, those orderings return nothing and the ui says so. The
recently-read and most-followers orderings are always live.

---

## 7. Motion

| Event         | Spec                                                               |
| ------------- | ------------------------------------------------------------------ |
| hover         | 150ms, background and the name underline                           |
| section entry | 320ms fade and 8px rise, staggered 50ms per `--i`, capped at 250ms |
| loading       | 1.3s sweep, transform only                                         |
| press         | 1px down on the primary button                                     |

`prefers-reduced-motion: reduce` stops all of it, including Tailwind's
`animate-pulse`, which is not reduced-motion aware on its own.

---

## 8. Copy rules

- **No em-dashes or en-dashes in anything a reader sees.** Not in headings,
  body, buttons, alt text or meta descriptions. Use a period, a comma, or
  restructure.
- **Never say user data is deleted.** The policy is hide-only. The opt-out hides
  records and is reversible, and the copy says so: _"The opt-out is reversible:
  switching it back off restores your entry."_ ("Deleted their account" on the
  banned page is fine, that is a Twitch user deleting their own Twitch account.)
- No "Oops", no exclamation marks in success messages, no Title Case headings.
- **Error states are written per cause.** Name the cause in the heading in
  words rather than as a status code, say explicitly what was and was not
  written, and offer a retry only where retrying could change the answer. A ban
  reverses, so it gets a retry; a deleted account does not, so it does not.

---

## 9. Do not change

- URL structure, route slugs, the `/c/` and `/u/` redirects
- The section ids in `/tos` (`acceptance`, `service`, `your-data`, `accounts`,
  `use`, `disclaimer`, `changes`, `contact`). They are linked from the sign-in
  gate and from outside the site.
- `/health` on any service
- The `/api/v1/...` path shape in this app. That `/api` is a real section of a
  web app, not a repetition of a hostname. See the workspace CONVENTIONS.md.
- The mark, or any palette value
- Form field names or ordering
- `misc/roles.ts` role ids

---

## 10. Dependencies

**Tailwind is 3.4.6, not v4.** Do not migrate.

**heroui stays, for two components only.** After the port it renders `Dropdown`
(the account menu and the list sort menus) and `Tooltip` (badge names). Button,
Input, Select, Switch, Skeleton, Snippet and Avatar were all replaced by plain
markup against the classes in section 5. Dropping the dependency entirely means
swapping those two for Radix or hand-rolling a menu with the focus management
that implies; that is a separate decision from this port and was deliberately
not bundled into it.

If heroui does go, three things go with it: the `./node_modules/**/@heroui/theme/dist/**`
content glob in `tailwind.config.mjs` (its long comment explains why it is
shaped oddly, and it becomes dead the moment the plugin does), the
`HeroUIProvider` in `providers.tsx`, and the `[data-slot='input-wrapper']`
focus-outline rule in `globals.css`.

**Tailwind's content globs cover all of `src/`.** They used to cover only `app/`
and `components/`, which meant the per-role class names in `misc/roles.ts`
(`text-founder`, `corner-bl`) were never emitted and the founders heading
rendered with a colourless corner.

**react-window stays.** `UserList` virtualises at `itemSize={52}`.

**The theme is dark-only.** `layout.tsx` hardcodes `dark` on `<html>` and
`providers.tsx` uses `forcedTheme="dark"`. Leave both alone. The light theme in
the heroui config is unused. If a light mode is ever added, declare
`<meta name="color-scheme">` or Chrome's auto-dark will invert the page.

---

## 11. Verifying a change

- Compare against `/design`, which renders every primitive from the shipped
  CSS. Do not eyeball from memory.
- Check at ~1440px and at ~380px. The row templates collapse under 640px, and
  the profile tabs switch to short labels there.
- `prefers-reduced-motion` must kill all motion.
- 13px+ text needs 4.5:1. Re-read section 3 before using `primary-500`.
- Grep the diff for em-dashes and for "delet" before committing.
