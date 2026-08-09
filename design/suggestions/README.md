# design/suggestions/

Three redesign directions for `moddex.tv`, drawn against the shipped comps in
[`../`](../index.html).

Start at [`v3/index.html`](v3/index.html). Every page in every folder carries a
switcher in the bottom-right that jumps to the same page in **shipped / v1 / v2
/ v3**.

**The mark is untouched everywhere.** Every colour in all three comes out of
`tailwind.config.mjs`; v2 changes one token and v3 changes none.

---

## The three

| | **v1 Index** | **v2 Native** | **v3** |
| --- | --- | --- | --- |
| Argument | The current design is right and under-executed | It is a Twitch companion tool, so it should look like it belongs there | v2's structure, its own identity, and much more air |
| Verdict | liked | kind of, not quite | current front-runner |
| Type | Cairo and Lato, already in the repo | Inter, which Twitch ships | Manrope |
| Base size | 15px | 14px | 15px |
| Row height | 72px | 36px | 52px |
| Container | 1180px | 1280px | 1440px |
| Search lives | In a hero on two pages | In the nav | In the nav |
| Left rail | None | 240px | None |
| Palette changes | none | one token | none |

---

## How v3 was arrived at

v3 is not a fourth idea. It is five verdicts applied in order, and the two
scrapped attempts are the most useful thing in this folder:

| Attempt | Verdict | What it settled |
| --- | --- | --- |
| v1 Index | liked | Dark, modern sans, room to breathe |
| v2 Telemetry *(scrapped)* | read as generated | Dark canvas + saturated accents + tracked-out mono is a house style |
| v2 Almanac *(scrapped)* | read as generated | Light serif on paper is the other house style |
| v2 Native | kind of, not quite | Structure right, identity borrowed from Twitch |
| v3 Records *(scrapped)* | old-fashioned, table-like, clamped | No Arial, no bordered grids, no squeeze |

Two failures share one root cause worth writing down:

> Both scrapped v2 attempts were **costumes over the same wireframe**. Heading,
> paragraph, table, section, table, in different clothes. Swapping the font and
> the background colour does not change what a page *is*.

And each reached for a style generators default to. A near-black canvas with two
saturated accents is the first. A light-weight serif on cream is the second, and
`design-taste-frontend` §4.1 names that one in as many words: *"'It feels
creative / premium / editorial' is NOT a reason to reach for serif. The agent's
default mental model that 'creative brief = serif' is the single most-tested AI
tell in production rounds."* The almanac attempt broke that rule while quoting
the skill approvingly.

---

## What v3 does

**Kept from v2**, because it was structurally right:

- Search in the nav on every page, so nothing needs a hero whose only job is to
  hold a search box
- A profile header with tabs for the two lookup directions
- Roles as lists of people, never as a spreadsheet

**Its own identity**, which is the fix for "not quite":

- Purple is demoted to the two controls that actually talk to Twitch. Everywhere
  else the accent is the mark's own green and pink. Exactly one filled purple
  element per page, at most.
- The left rail is gone. It was the most obviously borrowed element and it was
  eating 240px of width.
- The tab underline is the role's colour, so which direction you are reading is
  stated in the brand's own notation. Watch it flip green to pink between
  `channel-detail` and `user-detail`.

**Opened up**, which is the fix for "clamped":

| | v3 Records | v3 |
| --- | --- | --- |
| row height | 26px | 52px |
| base type | 13px | 15px |
| container | 1200px | 1440px |
| gutters | 12px | 32px |
| panel padding | 8px | 24px |

**Not table-like:** there is not one `<table>` in v3. Rows are CSS grids on a
shared column template with hover and nothing between them but air. Column
labels exist, light and unboxed above the first row, because unlabelled numbers
were a real problem in the shipped design.

---

## The audit all three answer

### Broken, not debatable

1. **There is no body typeface.** Lato is self-hosted in `src/app/fonts` and
   loaded by `layout.tsx`, but nothing carries `font-lato`, so every paragraph
   on the live site renders in the browser's default sans.
2. **Two measures.** `/donate`, `/donate/success`, `/settings`, `/tos` and
   `/dashboard` wrap in `max-w-3xl px-6`; everything else uses the 5xl
   `<Container>`.
3. **A hairline under all 24 rows** in `UserListItem`. A fence, not a table.
4. **Unlabelled columns.** A row is avatar, name, date, number, with nothing
   saying what the date or the number is until you hover.

### Weak, arguable

5. The counts are the quietest thing on the home page, at 14px.
6. 72px rows on a lookup tool. A 24-mod channel is 1728px of list.
7. The error family is a red number over a centered sentence and offers nothing
   to do, on a product where nearly every 404 is a mistyped name.
8. The 403 for an opted-out account reads as a failure. It is the privacy
   promise in `/tos` §3 working exactly as written.
9. `/donate` thanks you before you have done anything, under a reaction image.
10. `/dashboard` is one line of German inside an otherwise English app.

---

## Two things to decide

**Em-dashes are gone from all copy in all three folders.** The
`design-taste-frontend` skill bans the character outright, so sentences were
restructured. That is a change to voice, not just visuals.

**`/dashboard` below its heading is a proposal in all three**, since the shipped
page is a stub with nothing to redesign.

---

## What shipping v3 would need

- **Manrope self-hosted**, the way Lato and Cairo already are in
  `src/app/fonts`. `next/font/local` is already wired. It is also one line in
  `assets/theme.js` if you want a different face.
- **Radius unbanned** in `globals.css`, which currently forces `border-radius: 0`
  on every control.
- **No palette change at all.** Every colour is the shipped dark theme.
- The four audit fixes above, which apply whichever direction wins.

---

## How the files work

```
suggestions/
├── v1/  assets/{theme.js, v1.css, chrome.js} + 19 pages
├── v2/  same shape; chrome.js also builds the rail
└── v3/  same shape
```

Each page file holds its `<main>` and nothing else, which is the part that
differs between directions. Pages declare their state on `<body>`:

```html
<body data-scope="channel" data-auth="in">
```

`data-scope` is what the nav search looks up, and it flips to Person on the
person routes.

Adding a page: add a row to `PAGES` in that folder's `chrome.js` and write the
file.

Anything under the `comp helpers` comment in the CSS is scaffolding standing in
for React components a static file cannot render: `.avatar`, `.skeleton`,
`.toggle`, `#vswitch`. None of it should be ported back.

---

## Skills used

Fetched from [`leonxlnx/taste-skill`](https://github.com/leonxlnx/taste-skill)
and installed project-only in `.claude/skills/`:

- `design-taste-frontend` for the brief inference, the dials, the redesign
  protocol and the pre-flight check. Its §4.1 serif rule identified the failure
  in the scrapped almanac attempt.
- `redesign-existing-projects` for the audit
- `full-output-enforcement` for delivering whole page sets rather than samples
