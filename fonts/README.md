# Brand fonts (not included in the repository)

The approved Figma design uses three licensed typefaces that cannot be redistributed here.
Drop the files below into this folder and they are picked up automatically by `src/app/fonts.css`.
Until then the site falls back to system fonts (headline) and Geist Mono (display numerals).

| Family         | Style   | Expected file                 | Used for                              |
| -------------- | ------- | ----------------------------- | ------------------------------------- |
| Clash Grotesk  | Regular | `ClashGrotesk-Regular.woff2`  | All headings                          |
| At Aero        | Retina  | `AtAero-Retina.woff2`         | Body copy (20px)                      |
| At Aero        | Light   | `AtAero-Light.woff2`          | Small body copy (14–16px)             |
| Ponte Dot      | Regular | `PonteDot-Regular.woff2`      | Dotted display numerals (01, 2022…)   |

Geist Mono ships with the `geist` npm package and needs no files.
