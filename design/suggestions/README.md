# design/suggestions/

Two redesign directions for `moddex.tv`, drawn against the shipped comps in
[`../`](../index.html).

Open [`v1/index.html`](v1/index.html) or [`v2/index.html`](v2/index.html). Every
page carries a switcher in the bottom-right corner that jumps between the same
page in **shipped / v1 / v2**, which is the way to look at these.

**Brand is locked in both.** The mark is untouched. Every colour is copied value
for value out of `tailwind.config.mjs`. No route, slug, anchor id or nav label
moves.

---

## The two directions

|  | **v1 Index** | **v2 Telemetry** |
| --- | --- | --- |
| Mode | Redesign, preserve | Redesign, overhaul |
| Question | Is the existing design succeeding on its own terms? | What is the product for, and what would an interface built only for that look like? |
| Body face | Lato, finally applied | Monospace, everywhere except prose |
| Row height | 72px, as shipped | 36px |
| Measure | 1180px | 1440px |
| Dividers | Hairline under column heads only | 1px grid gaps, every compartment |
| Texture | Grain at 3% | Scanlines plus grain |
| Dials | variance 6 / motion 4 / density 4 | variance 8 / motion 5 / density 8 |
| Risk | Low. Mostly CSS and one container swap | High. New language, needs commitment |

Rather than guess whether "recreate these pages" meant polish or overhaul, the
two answers are both here. v1 is what you ship if the current design is right and
under-executed. v2 is what you ship if the current design is generic and the
product deserves its own language.

---

## The audit, first

Both directions come out of the same read of the shipped site.

### Broken, not debatable

1. **There is no body typeface.** Lato is self-hosted in `src/app/fonts` and
   loaded by `layout.tsx`, but nothing carries `font-lato`, so every paragraph
   on the live site renders in the browser's default sans. One class fixes it,
   and it is the single largest visual change in v1.
2. **Two measures.** `/donate`, `/donate/success`, `/settings`, `/tos` and
   `/dashboard` wrap in `container mx-auto max-w-3xl px-6`; everything else uses
   the 5xl `<Container>`. Those five pages sit on a different left edge than the
   wordmark above them.
3. **A hairline under all 24 rows.** `UserListItem` puts `border-b` on every
   row. That reads as a fence, not a table.
4. **Unlabelled columns.** A row is avatar, name, date, number, with nothing
   saying what the date or the number is until you hover one of them.

### Weak, arguable

5. **The counts are the quietest thing on the home page.** 8.1 million mod
   records is the most impressive fact about the product and it is set at 14px.
6. **72px rows on a lookup tool.** A 24-mod channel is 1728px of list. Half of
   each row is empty.
7. **The error family is a red number over a centered sentence** and offers
   nothing to do, on a product where nearly every 404 is a mistyped name.
8. **The 403 for an opted-out account reads as a failure.** It is the privacy
   promise in `/tos` section 3 working exactly as written.
9. **`/donate` thanks you before you have done anything**, under a reaction
   image, then explains the badges in one run of prose.
10. **`/dashboard` is one line of German** inside an otherwise English app.

### Kept in both directions

The mark and its two-corner bracket vocabulary. The full palette. The
square-cornered geometry. Cairo at display sizes. The dark canvas, since there
is no light mode to honour and no toggle left. Every route, slug, anchor id and
nav label. The `/health` endpoint's place in the footer's status link.

---

## Colour, in both

Mod green `#4ADE80` and vip pink `#F472B6` are **data colours**. They mark a
role and nothing else. No green buttons, no pink links, no coloured chrome, no
accent borders. The neutral ramp carries the whole interface and twitch purple
appears on exactly one control: the one that talks to twitch.

The shipped site follows this loosely. Making it absolute is what lets the two
hues mean something when they do appear, and it is the reason a founder-amber or
artist-blue corner still reads as new information rather than decoration.

v2 additionally overrides the industrial-brutalist skill's specified hazard-red
accent, because brand lock wins over the skill.

---

## Two things to decide

**Em-dashes are gone from all copy in both folders.** The `design-taste-frontend`
skill bans the character outright, so every sentence was restructured around
periods, commas and parentheses. That is a change to voice, not just to visuals.
If you want the copy back as written, the layouts do not depend on it.

**`/dashboard` below its first line is a proposal in both directions, not a
redraw.** The shipped page has no content to redesign, so both versions sketch
what belongs there. Treat those screens as a suggestion about direction, not a
spec.

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
stands alone, these generate the chrome from `chrome.js`. These two folders exist
to be compared against each other, so every byte that is identical across 17
pages is noise in that comparison. Each page file holds its `<main>` and nothing
else, which is exactly the part that differs.

Pages declare their state on `<body>`:

```html
<body data-nav="channel" data-auth="in">
```

Adding a page: add a row to `PAGES` in `chrome.js` and write the file.

Tailwind comes from the play CDN, so these want a network connection for layout.
Type (`src/app/fonts/*.woff2`) and badges (`design/badges/*.svg`) are local.

Anything under the `comp helpers` comment in `v1.css` and `v2.css` is
scaffolding standing in for React components a static file cannot render:
`.avatar`, `.skeleton`, `.switch`, `#vswitch`. None of it should be ported back.

---

## Skills used

Fetched from [`leonxlnx/taste-skill`](https://github.com/leonxlnx/taste-skill)
and installed project-only in `.claude/skills/`:

- `design-taste-frontend` for the brief inference, the dials, the redesign
  protocol and the pre-flight check
- `redesign-existing-projects` for the audit above
- `industrial-brutalist-ui` for v2's Tactical Telemetry archetype
- `full-output-enforcement` for delivering all 38 pages rather than a sample
