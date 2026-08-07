# Fonts

Committed on purpose. `next/font/google` downloads these during `next build`,
which puts a network call inside the docker build; in the emulated arm64 half of
the cross-build that call ran for 503 s and then failed, which is why no arm64
image ever came out of CI. Self-hosting removes the network from the build.

These are the **latin subset only**, byte-for-byte what the Google Fonts CSS API
was serving on 2026-08-07 — the same subset the old `subsets: ['latin']` config
asked for, so the swap changes nothing about how the site renders.

| file | family | weight | source |
|---|---|---|---|
| `lato-300.woff2` | Lato v25 | 300 | `S6u9w4BMUTPHh7USSwiPGQ.woff2` |
| `lato-400.woff2` | Lato v25 | 400 | `S6uyw4BMUTPHjx4wXg.woff2` |
| `lato-700.woff2` | Lato v25 | 700 | `S6u9w4BMUTPHh6UVSwiPGQ.woff2` |
| `cairo-700.woff2` | Cairo v31 | 700 | `SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hAc5a1PiLA.woff2` |

Both families are licensed under the SIL Open Font License 1.1, which permits
redistribution as part of a larger work. Lato © Łukasz Dziedzic; Cairo © the
Cairo Project Authors.

Non-latin glyphs fall back to the system stack, exactly as before — if that ever
needs to change, add the `latin-ext` subset files rather than reaching back for
`next/font/google`.
