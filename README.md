# Ponte — website

Official marketing site for Ponte. Implemented from the Figma design (`Ponte — All`, page **Dev Handoff**) in Next.js 16 (App Router), TypeScript, Tailwind CSS 4 and Motion for React.

## Stack

| Concern      | Choice                                                        |
| ------------ | ------------------------------------------------------------- |
| Framework    | Next.js 16.4 (App Router, Turbopack)                          |
| Language     | TypeScript 5                                                  |
| Styling      | Tailwind CSS 4 — design tokens live in `src/app/globals.css`  |
| Motion       | `motion` (Motion for React) — scroll-linked + in-view         |
| Fonts        | Geist Mono / Geist Sans (npm); Clash Grotesk + Ponte Dot from an encrypted private bundle (see Fonts) |
| Hosting      | Netlify (`netlify.toml`, `@netlify/plugin-nextjs`)            |

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in real URLs
npm run dev                  # http://localhost:3000
```

Checks:

```bash
npx tsc --noEmit   # types
npm run lint       # eslint
npm run build      # production build
```

## Project layout

```
src/
  app/             layout, page, globals.css (tokens), fonts.css, metadata routes
  components/
    layout/        Header (desktop nav, compact header, mobile menu), Footer
    sections/      Hero, TrackRecord, Products (P2P · OTC · WhatsApp), Trust, Story, Faq, FinalCta
    ui/            Button, Primitives (Tag, Marker, Chip), Reveal (text/section entrances), icons
  hooks/           useActiveSection, useScrollDirection, useIsDesktop
  lib/             site.ts (config + links), content.ts (all copy), motion.ts (easing/variants)
public/
  brand/ icons/ illustrations/ images/   assets exported from Figma
  fonts/           drop licensed font files here (see README inside)
docs/figma-spec.md full extracted spec with node ids, coordinates and copy
```

## Configuration

All external destinations are environment variables (see `.env.example`). Nothing is hard-coded:
until a value is provided, the link falls back to an in-page anchor (`#launch`, `#faq`, …) so no
invented URL ever ships. `NEXT_PUBLIC_SITE_URL` drives canonical/OG/sitemap/robots.

## Fonts

| Family | Weight(s) | Used for | Licence | How it ships |
| --- | --- | --- | --- | --- |
| Clash Grotesk | 400 (500 in mockups) | Headings | ITF Free Font License — self-hosting on Ponte's own site permitted, redistribution and format conversion not | Private font bundle, installed at build time |
| Ponte Dot / Ponte Dot Mono | 400 | Display numerals (`2022`, `01`, `1/4`, `$2.3M+`) | Ponte's own typeface (fsType 0) | Private font bundle, installed at build time |
| Geist Mono | 400 / 500 | Buttons, nav, tags, labels | SIL OFL | `geist` npm package |
| At Aero (Retina 350 / Light 300) | | Body copy | Arillatype.Studio EULA — the archive provided is marked "Free for Personal Use" and the OTFs are flagged *preview & print only* (fsType 4), so it is **not** web-embedded until a commercial web licence is confirmed | `public/fonts/at-aero.css` is linked automatically once licensed files are added to the bundle; until then body copy uses Geist Sans |

Font files are deliberately **not committed** to this public repository (the Clash Grotesk licence
forbids redistribution). `npm run build` runs `scripts/prepare-fonts.mjs`, which installs the
unmodified official `.woff2` files into `public/fonts/` (git-ignored) from the build environment:

- `FONTS_BUNDLE_B64` — base64 of `fonts.tar.gz` as a secret Netlify build variable (split into
  `FONTS_BUNDLE_B64_1`, `_2`, … when a single value is too long), or
- `FONTS_KEY` + a local, git-ignored `assets/fonts.enc` (AES-256-GCM), or
- `FONTS_ARCHIVE_URL` (+ optional `FONTS_ARCHIVE_TOKEN`) pointing at a private copy.

Without any of these the build still succeeds and the fallback stacks apply.

## Brand animations

- **Light Bridge** (`src/lib/lightBridge.ts`, `<LightBridge>`): the designer's WebGL shader
  (`ponte-light-bridge-green.html`, "Hero" preset) replaces the video-frame fills behind the hero,
  the trust section (turned on its side, as in Figma) and the final CTA. It renders only while on
  screen, pauses in hidden tabs, draws a single still frame under `prefers-reduced-motion`, and
  falls back to `public/images/rays-poster.png` without WebGL.
- **Black hole** (`src/lib/blackHole.ts`, `<BlackHole>`): the designer's WebGL piece on the 404 page
  ("Ponte" preset, portal layout, cursor interaction; quarter speed under reduced motion).
- **Lottie** (`public/animations/*.json`, `<Lottie>`): the official line drawings — rings, spiral,
  circle and support in the Trust panels, spring (escrow loops) on the About card — played with
  lottie-web's light SVG player, only while visible; frozen on their final frame under reduced motion.

## Motion system

- Headlines reveal line-by-line from a clip mask; body copy and cards rise/fade in view.
- **Hero** pins for ~1.9 viewports: backdrop parallax, copy settles, device mockup takes over.
- **Track record** pins for 4 viewports and steps through four facts; swipeable slider on mobile.
- **P2P → OTC → WhatsApp** is one pinned sequence: the lime panel slides/resizes between the three
  layouts while compositions crossfade. Stacked sections on mobile.
- **Trust** tabs follow scroll (also clickable / arrow keys); stacked cards on mobile.
- **Story** is a regular slider (chips, arrow keys, swipe) with a filling progress line.
- **FAQ** is an accessible accordion with smooth height animation.
- **Final CTA** routes draw toward the button; on desktop the panel shrinks to reveal the animated
  gradient and the footer slides in underneath.
- Everything honours `prefers-reduced-motion` (pinning is kept, transforms are removed).

## Deployment (Netlify)

1. Create a new site from the `sttitus-hash/ponte-website` repository.
2. Build command `npm run build`, publish directory `.next` (both set in `netlify.toml`); Netlify
   installs `@netlify/plugin-nextjs` automatically for Next.js projects.
3. Add the environment variables from `.env.example` in *Site configuration → Environment variables*.
4. Deploy a preview first; production deploys and DNS changes require explicit approval.

## Outstanding (needs content/assets from Ponte)

- FAQ answers 02–08 are not in Figma; drafts assembled from approved on-page copy are marked
  `draft: true` in `src/lib/content.ts` and need sign-off.
- Licensed font files (Clash Grotesk, At Aero, Ponte Dot).
- Real URLs: web app, App Store, Google Play, WhatsApp assistant, support, legal pages, X, Telegram.
- Video backgrounds (hero, trust, CTA gradient) are stills / CSS in this build; drop MP4/WebM in
  `public/video` and swap the `Image` backdrops for `<video>` when available.
- Product mockups use `$PONTE` as a purely illustrative token in the trade demonstrations (edited from the Figma `$OWJ` assets); nothing on the site states or implies that a token has launched, is tradable or has a market price.

## Static preview (GitHub Pages)

`STATIC_EXPORT=1 BASE_PATH=/ponte-website NEXT_PUBLIC_BASE_PATH=/ponte-website NEXT_PUBLIC_SITE_URL=https://sttitus-hash.github.io/ponte-website npm run build`
writes a fully static site to `out/`, which is published on the `gh-pages` branch. Netlify/production
builds do not set these variables.
