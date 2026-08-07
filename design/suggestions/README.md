# design/suggestions/

Two redesign directions for `moddex.tv`, drawn against the shipped comps in
[`../`](../index.html).

Open [`v1/index.html`](v1/index.html) or [`v2/index.html`](v2/index.html). Every
page carries a switcher in the bottom-right corner that jumps between the same
page in **shipped / v1 / v2**, which is the way to look at these.

**The mark is untouched in both.** Every colour in both comes out of
`tailwind.config.mjs`.

---

## The two directions

|  | **v1 Index** | **v2 Almanac** |
| --- | --- | --- |
| Mode | Redesign, preserve | Redesign, overhaul |
| Ground | Near-black canvas | Paper, on a desk |
| Palette | The `dark` theme from `tailwind.config.mjs` | The `light` theme from the same file |
| Display | Cairo, heavy | Newsreader, set at 300 |
| Body | Lato, finally applied | Newsreader at 18px |
| Data | Lato with mono numerals | Archivo with lining tabular figures |
| Labels | Tracked-out uppercase mono | Italic serif, sentence case |
| Tables | Rule under the column head | Rules above, below and at the foot only |
| Apparatus | Chips and control rows | Notes in the margin |
| Motion | Staggered entrances, 4/10 | One fade, 2/10 |
| Risk | Low. Mostly CSS and one container swap | High. New fonts, light theme, bigger swing |

v1 is what you ship if the current design is right and under-executed. v2 is
what you ship if you want the product to look like nothing else.

---

## Why v2 is what it is

The first attempt at v2 was a dark "tactical telemetry" direction, and it was
scrapped because it still read as generated. That was the correct call, and the
reason is worth writing down:

> A near-black canvas, two saturated accents, and tracked-out uppercase
> monospace labels **is** the house style of generated interfaces. Rearranging
> those same materials produces another variation on the same thing. The fix is
> different materials.

So this v2 starts from what the product actually is rather than from a mood.

**moddex is a directory.** Two and a half million entries, cross-referenced two
ways, each with a date attached. The best-designed dense-data objects ever made
are printed directories: almanacs, ships' registers, timetables, library
catalogues. Centuries of work went into making thousands of rows of names and
dates readable on paper, and almost none of it looks like a website.

Everything in v2 is borrowed from that tradition, and each device is doing a job
its web equivalent does worse:

| Device | Doing what |
| --- | --- |
| The sheet | Paper on a desk. Gives content an edge, which a max-width container never quite does. |
| Register marks | The mark is two corner brackets 180° apart, which is exactly what a printer's registration mark is. Put them on the corners of the sheet and the page becomes the logo, at page scale, without drawing it anywhere. |
| Booktabs rules | Thick above the head, thin below, thin at the foot, nothing between rows. The convention every typesetting manual has recommended for a century, and the exact opposite of the shipped hairline-under-all-24-rows. |
| The margin | Timestamps, sources and notes sit beside the text, not in chips inside it. |
| Italic labels | A printed table labels its columns in italic. No uppercase anywhere. |
| Two figure sets | Old-style figures in prose so numbers sit in the line; lining tabular figures in columns so they stack. Two jobs, two settings. |
| The colophon | Says what the volume is set in and what it holds. Web footers usually say nothing. |
| A ticked box | A binary on paper is a box you tick, not a sliding switch. The tick is the mark. |

Deliberately absent, because they are what made the scrapped v2 read as
generated: monospace, uppercase tracked-out micro-labels, a heavy display
grotesk, a dark canvas, saturated accents, cards, shadows.

---

## The palette in v2 already existed

`tailwind.config.mjs` has always carried a full `light` theme, with mod and vip
deliberately darkened and the comment *"darkened so the same tokens stay legible
on white"*. Somebody wrote that, and it has never once rendered, because
`layout.tsx` hardcodes `dark` on the `<html>` element.

v2 is not a new palette. It is the half of the existing one that never shipped.

---

## The audit, which both directions answer

### Broken, not debatable

1. **There is no body typeface.** Lato is self-hosted in `src/app/fonts` and
   loaded by `layout.tsx`, but nothing carries `font-lato`, so every paragraph
   on the live site renders in the browser's default sans.
2. **Two measures.** `/donate`, `/donate/success`, `/settings`, `/tos` and
   `/dashboard` wrap in `max-w-3xl px-6`; everything else uses the 5xl
   `<Container>`. Those five sit on a different left edge than the wordmark.
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

**Em-dashes are gone from all copy in both folders.** The `design-taste-frontend`
skill bans the character outright, so every sentence was restructured. That is a
change to voice, not just visuals. The layouts do not depend on it.

**`/dashboard` below its heading is a proposal in both**, since the shipped page
is a stub with nothing to redesign.

---

## What shipping v2 would need

Beyond the markup, three things v1 does not need:

- **Two font files self-hosted.** Newsreader and Archivo come from the Google
  CDN in these comps. The repo already self-hosts Lato and Cairo in
  `src/app/fonts`, so the pattern exists and `next/font/local` is already wired.
- **The `dark` class off `<html>`.** `layout.tsx` hardcodes it, with a comment
  explaining that heroui renders white surfaces without it. Wiring the light
  theme properly is the real work.
- **`<meta name="color-scheme" content="light">`.** Chrome's auto-dark-mode
  will invert an undeclared light page, which turns this direction into a bad
  version of v1 on any machine with that flag on. Not optional.

---

## How the files work

```
suggestions/
├── v1/
│   ├── assets/theme.js     palette + type scale for the play CDN
│   ├── assets/v1.css       the design system
│   ├── assets/chrome.js    header, footer, page registry, switcher
│   └── 19 page files
└── v2/                     same shape, different system
```

Unlike `../*.html`, which duplicate the header into every file so each comp
stands alone, these generate the chrome from `chrome.js`. These folders exist to
be compared, so every byte identical across 17 pages is noise in that comparison.
Each page file holds its `<main>` and nothing else, which is the part that
differs.

Pages declare their state on `<body>`:

```html
<body data-nav="channel" data-auth="in">
```

Adding a page: add a row to `PAGES` in `chrome.js` and write the file.

Anything under the `comp helpers` comment in `v1.css` and `v2.css` is
scaffolding standing in for React components a static file cannot render:
`.portrait`, `.skeleton`, `.mark-box`, `#vswitch`. None of it should be ported
back.

---

## Skills used

Fetched from [`leonxlnx/taste-skill`](https://github.com/leonxlnx/taste-skill)
and installed project-only in `.claude/skills/`:

- `design-taste-frontend` for the brief inference, the dials, the redesign
  protocol and the pre-flight check
- `redesign-existing-projects` for the audit
- `full-output-enforcement` for delivering all 38 pages rather than a sample

`industrial-brutalist-ui` drove the scrapped v2 and is no longer used by
anything here.
