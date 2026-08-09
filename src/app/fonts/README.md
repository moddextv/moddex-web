# Fonts

Committed on purpose. `next/font/google` downloads these during `next build`,
which puts a network call inside the docker build; in the emulated arm64 half of
the cross-build that call ran for 503 s and then failed, which is why no arm64
image ever came out of CI. Self-hosting removes the network from the build.

This is the **latin subset only**, byte-for-byte what the Google Fonts CSS API
was serving on 2026-08-07.

| file                  | family      | weight               | source                         |
| --------------------- | ----------- | -------------------- | ------------------------------ |
| `manrope-latin.woff2` | Manrope v20 | 200 to 800, variable | `xn7gYHE41ni1AdIRggexSg.woff2` |

**Manrope is one file, not five.** Google serves it as a variable font: the CSS
API returns the same latin url for `wght@400`, `500`, `600`, `700` and `800`, and
the file carries `fvar`/`gvar`/`HVAR`, so every weight the design uses is
interpolated from these 24 KB. `layout.tsx` therefore declares a single `src`
entry with `weight: '200 800'`, the font's real axis range; naming a single
weight there would make the browser synthesise the others.

It is also the only typeface, and it is applied through `fontFamily.sans` in
`tailwind.config.mjs` rather than a `font-manrope` class. Tailwind's preflight
sets `font-family: theme('fontFamily.sans')` on `<html>`, so overriding that one
key is what gives the whole site a body face.

Lato and Cairo used to live here and were removed once the v3 port landed. Lato
was downloaded on every page load and applied to no element at all, which is why
body copy rendered in the browser default; Cairo set headings in a face the
current direction does not use.

Manrope is licensed under the SIL Open Font License 1.1, which permits
redistribution as part of a larger work. Manrope © Mikhail Sharanda and the
Manrope Project Authors.

Non-latin glyphs fall back to the system stack. If that ever needs to change,
add the `latin-ext` subset file rather than reaching back for
`next/font/google`.
