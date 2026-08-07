# design/

Static HTML comps of every page `moddex.tv` can render. Open
[`index.html`](index.html) — it lists them all and every comp carries a **pages**
switcher in the bottom-right corner.

These are not built, bundled or served. They are plain files you open in a
browser, and they exist so a page can be looked at, argued about and edited
without running next.

## Redesign suggestions

Two directions live in [`suggestions/`](suggestions/README.md), drawn against
these comps with the mark and the full palette locked:

- [**v1 Index**](suggestions/v1/index.html) — the evolution. This design, its own
  rules actually enforced, on the dark theme.
- [**v2 Almanac**](suggestions/v2/index.html) — the overhaul. The product set as
  a printed directory, on the light theme that has been sitting unused in
  `tailwind.config.mjs`.

The switcher on every comp jumps to the same page in either direction.

## What is faithful, and what is not

Faithful: every class name, colour, duration, border and piece of geometry is
copied from `src/`. Markup can be moved in either direction between a comp and
its component.

Invented: the data. No twitch avatar is fetched — profile pictures are tinted
initial blocks — and the counts are plausible rather than current.

Scaffolding: where one page has to show two states at once (a valid and an
invalid field, a resolved and an unresolved donation), the second sits below a
hairline rule labelled in `text-primary-600`. Those labels have no counterpart
in `src/`. Neither do `.avatar`, `.skeleton`, `.switch` or `#comp-switcher` in
`assets/design.css`, which stand in for React components a static file cannot
render; they are fenced off under a comment in that file.

## The three files that hold the system

| file | what it is |
| --- | --- |
| `assets/theme.js` | the palette, flattened out of what the heroui plugin generates in `tailwind.config.mjs`. If the palette moves there, move it here too. |
| `assets/design.css` | brackets, ticks, motion tokens, the a11y rules and the self-hosted fonts — copied from `src/styles/globals.css`. |
| `assets/pages.js` | the page registry `PAGES`, and the switcher built from it. `index.html` renders its table from the same array. |

Tailwind comes from the play CDN, so the comps want a network connection for
layout. Type (`../src/app/fonts/*.woff2`) and badges (`badges/*.svg`) are local.

## Adding a comp

Add a row to `PAGES` in `assets/pages.js` and write the file. The switcher and
the index pick it up; nothing else needs updating.

Copy the nearest existing page rather than starting empty — the header and
footer are duplicated into every file on purpose, so each one stands alone and
reads top to bottom.

## The design, in three rules

Taken from the logo rather than invented around it. The mark is two corner
brackets in 180° rotational symmetry on a 32-unit grid: stroke 6, inner channel
4.

1. **Corners, not boxes.** Content is framed by two opposing brackets, never by
   a full border. A full box is a card, and a card is the generic shape this
   design exists to avoid.
2. **Hard orthogonal geometry.** No border radius anywhere. The mark has no
   curves, so neither does the interface.
3. **A 4px module.** Every spacing, size and offset is a multiple of the mark's
   own grid unit.

Colour follows from the same place: the chrome is a colourless neutral ramp, and
the only two hues the UI spends are mod green (`#4ADE80`) and vip pink
(`#F472B6`) — the twitch sword and gem, and the two halves of the mark.
[`components.html`](components.html) shows all of it on one page.

## One thing the comps make visible

`/donate`, `/donate/success`, `/settings`, `/tos` and `/dashboard` still wrap in
`container mx-auto max-w-3xl px-6` instead of the `<Container>` the redesign
introduced, so their left edge does not line up with the wordmark above them.
That is reproduced here rather than quietly fixed — put those pages next to
`home.html` or `channel-detail.html` and the two measures are obvious.
