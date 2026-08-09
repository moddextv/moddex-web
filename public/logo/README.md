# moddex — mark 1a (the inversion)

Geometry: two identical corner brackets in 180° rotational symmetry on a 32-unit grid.
Bracket A: 4,4 18,4 18,10 10,10 10,18 4,18 — B is A rotated 180° about (16,16).
Stroke weight = 6 units; inner channel = 4 units. No fine interior detail: silhouette only.

## Files
- moddex-mark.svg — primary, monochrome, inherits `currentColor` (site header, 22x22)
- moddex-mark-color.svg — bracket A mod green #4ADE80, bracket B VIP pink #F472B6 (128px+)
- moddex-favicon.svg — mark on #0B0B0C, ships as the tab icon
- moddex-favicon-16.png / -32.png — pixel-checked favicon rasters
- moddex-chatbadge-18.png — FrankerFaceZ inline badge (transparent, 18px)
- moddex-badge-128.png / -green / -pink — 128px badge art, transparent
- moddex-og-128.png — social card tile on #0B0B0C
- moddex-discord-512.png — server icon, safe inside a circular crop
- moddex-lockup-horizontal.svg — mark + 12px gap + wordmark, cap-aligned
- moddex-lockup-stacked.svg — mark centred over the wordmark

## Rules
- Clear space = 4 grid units (12.5% of the mark's width) on all sides.
- Minimum size 16px. Below 16px use the favicon raster, not the SVG.
- Colour is never load-bearing: the header, favicon and chat badge all run monochrome.
- Never recolour to Twitch purple. Never place on a hue other than canvas, white, or a
  neutral chat background.
- The two lockup SVGs reference Cairo 700 as a live font, so the wordmark falls
  back to a system face anywhere Cairo is not installed. Outline the text before
  shipping them off-site. The editable source used to be `public/files/logo.ai`;
  that is gone, so this needs redrawing in whatever tool comes next rather than
  editing. Note the app itself is unaffected — it draws the mark from paths in
  `components/UI/Mark.tsx` and sets the wordmark in Manrope, not Cairo.
