# Brand fonts

Installed here at build time by `scripts/prepare-fonts.mjs` (set `FONTS_BUNDLE_B64`, `FONTS_KEY` or `FONTS_ARCHIVE_URL`
in the build environment). Font files are deliberately not committed to this public repository.

| Family           | File                         | Weight | Used for                                  | Licence                                   |
| ---------------- | ---------------------------- | ------ | ----------------------------------------- | ----------------------------------------- |
| Clash Grotesk    | `ClashGrotesk-Regular.woff2` | 400    | All headings                              | ITF Free Font License (self-host allowed) |
| Clash Grotesk    | `ClashGrotesk-Medium.woff2`  | 500    | Mobile mockup headings                    | ITF Free Font License                     |
| Ponte Dot        | `PonteDot-Regular.woff2`     | 400    | Display numerals (2022, 01, 1/4, $2.3M+)  | Ponte brand typeface                      |
| Ponte Dot Mono   | `PonteDotMono-Regular.woff2` | 400    | Counters (optional)                       | Ponte brand typeface                      |
| At Aero          | `AtAero-Retina.woff2` (350), `AtAero-Light.woff2` (300) | | Body copy | **Not included — requires a commercial web licence from Arillatype.Studio.** Once licensed, add `AtAero-Retina.woff2`, `AtAero-Light.woff2` and an `at-aero.css` with the `@font-face` rules (weights 350 / 300) to the font bundle — `layout.tsx` links `/fonts/at-aero.css` automatically when the files are present. |

Geist Mono / Geist Sans come from the `geist` npm package (SIL OFL).
