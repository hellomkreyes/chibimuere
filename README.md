# 🔮 chibi muere 💀 [(visit here 👋)](https://chibimuere.com/)

A static portfolio site for GitHub Pages.

## 💻 About the build

Built with [Vite](https://vite.dev) as a multi-page static site.

The chibi muere website was built in collaboration with the following AI overlords:
- Co-pilot
- Claude

My AI developers are the smarter and more faster members of this project team. While I am given more time to focus on the fun internet experiences on the site, as well as all the stupid content. 😬

Make friends with 🤖! You'll never know who your boss will be in the future.

I hope my future boss is Keanu Reeves.

## How to run an environment 👟

```sh
npm install
npm run dev      # run locally with live reload
npm run build    # bundle production build into dist/
npm run preview  # preview the production build
npm test         # unit tests for the content plugin (node:test)
npm run budget   # first-visit size check (after a build)
npm run e2e      # Playwright + axe against the build (after a build)
```

`npm run e2e` needs browsers once: `npx playwright install chromium`
(WebKit hangs on macOS 14, so leave it to CI there:
`npx playwright test --project=chromium`).

Pushing to `main` builds and deploys to GitHub Pages via `.github/workflows/deploy.yml`.

## PR checks

`.github/workflows/checks.yml` runs on every pull request:

- **Build, unit tests, budget**: `npm test`, `npm run build`, then
  `scripts/check-budget.js`. Each page plus the CSS and JS it loads up front
  must stay at or under 50 KB gzipped (fonts and lazy chunks excluded). It
  also warns when a page's HTML alone passes 14 KB, roughly what arrives in
  the first round trip of a new connection.
- **Playwright + axe** (Chromium and WebKit), from `tests/site.spec.js`: every
  page in day and night loads without errors and with zero axe violations
  (WCAG 2.2 AA tags). Chromium also checks the theme toggle, pause motion, and
  that every in-page link has a target. Section PRs add one spec per section
  for its main interaction.
- **Screenshots** (Chromium): full-page, both themes, desktop and phone width,
  with motion off and the clock pinned. Baselines in `tests/screenshots` are made on
  GitHub's Linux runner, so screenshot checks are skipped locally. When a
  change is meant to look different (or a new page needs baselines), add the
  `update-screenshots` label to the PR: a bot commits fresh baselines and
  re-runs the checks. Look at the committed images in the PR diff before
  merging.
- **Lighthouse** (`lighthouserc.json`): mobile, median of 3 runs on the home
  and resume pages. Performance 90+, CLS under 0.1 and LCP under 2.5 s fail
  the check; accessibility and best practices under 100 warn. Reports are kept
  as a build artifact.

## Content JSON

All site copy lives in `src/content.json`: every heading, paragraph, label,
button, meta tag and screen-reader label, plus the project cards, brand names,
resume entries and social links. `scripts/content-plugin.js` bakes it into the
HTML at build time (and live in dev, reloading when the JSON changes). The
plugin's regex patterns live in `scripts/content-patterns.js`, each with a
plain-English comment and an example of the text it matches. The text in the
HTML is only a fallback; `content.json` wins.

- `site`: shared by every page (name, nav, theme button, footer, social links,
  and `site.ui` strings the scripts use, read through `src/js/copy.js`)
- `home`, `resume`, `notFound`: one section per page
  (`<body data-content-page="…">`)

Hooks in the HTML:

```html
<p data-copy="hero.lede">…</p>                          <!-- inner HTML -->
<meta data-copy-attr="content={{meta.description}}">    <!-- attributes -->
<template data-copy-list="portfolio.projects">…</template> <!-- one copy per item -->
<section data-copy-if="artsy.pictures artsy.webring">…</section> <!-- only if one has content -->
```

Keys starting with `site.` read the shared section, `page:key` reads another
page's section (`home:artsy.pictures` from resume.html), and anything else
reads the page's own.

`data-copy-if` drops the whole element at build time unless at least one of
its space-separated keys has content (an empty string, `false`, `{}` or a list
whose items are all `"show": false` count as empty). Put the same keys on a
section and on its nav links (on every page) so placeholders and broken
anchors never ship. Artsy and Fartsy use it until their new sections land. List templates use `{{field}}`, `{{#field}}…{{/field}}` (only when
set), `{{^field}}…{{/field}}` (only when not) and `{{@num}}` (01, 02, …); items
with `"show": false` are skipped.

Project cards: `link` makes the title clickable and `writeup` adds a "Read the
write-up" link (for the Substack case study or devlog). Both are optional.
Add `"newTab": true` to open the title link in a new tab, for links that leave
the site, such as a GitHub repo. Write-up links always open in a new tab.

## My Pictures (art)

The Artsy folder's pictures live in `public/art/`, made from originals in
`art-originals/` (git-ignored, so full-size files never get committed):

```sh
npm run images   # needs the originals in art-originals/
```

`scripts/images.js` makes AVIF + WebP thumbnails and full-size copies at 1x
and 2x, turns photos upright, strips all metadata (GPS included), converts
HEIC on macOS, and adds an entry per new picture to `home.artsy.pictures` in
`content.json` with `"show": false`. Fill in `title`, `year`, `medium` and
`alt`, then set `"show": true`. An original named `thumbs-db` becomes the
Thumbs.db easter egg. The six current pictures are generated placeholders.

## Webring

Entries live in `home.artsy.webring` in `content.json`:

```json
{
  "kind": "Fanfic",
  "name": "Title of the thing",
  "url": "https://…",
  "button": "♡ FANFIC",
  "added": "2026-10-02",
  "note": "Why I'm boosting it, in a line or two.",
  "cta": "Optional: a one-off call to action"
}
```

`kind` is free text: any new kind gets its own badge, filter chip and one of
six colour tones automatically. `artsy.ring.kinds` holds optional presets per
kind (a plural for its chip and a call to action, like "Get cooking" for
recipes); kinds without one use the catch-all "Go look". `button` is the
88x31 button's label. The ✦ new sparkle shows for 30 days after `added`.
Add `"show": false` to hide an entry.

## Day / Night 🌞🌚

The look comes from the day/night mockup (v4): soft prism light by day, a
glitchy CRT terminal by night.

- `src/styles/main.css`: all the styles, grouped by section (tokens → layers →
  nav → hero → sections → cursors → transitions).
- `src/js/theme.js`: the toggle, the flash/CRT transition, saving the choice
  (`chibi-theme` in localStorage) and following the system setting until
  someone picks. A tiny inline script in each page's `<head>` sets the theme
  before first paint so there's no flash of day at night.
- `src/js/effects.js`: sparkle canvas + butterfly. Capped at 30fps, 1x
  resolution, sprite-based, and it tones itself down on low-power devices and
  for `prefers-reduced-motion`.
- `src/js/cursors.js`: the glass (day) and pixel (night) cursors.
- `src/js/nav.js`: the ☰ menu and the frosted header on scroll. Below 1140px
  the nav links fold into the ☰ menu; on phones (≤700px) the buttons move to a
  bar along the bottom of the screen and the menu opens upward.

Show something in only one theme with `class="day-only"` or `class="night-only"`.

Motion: the ⏸ / ▶ button in the header (and "pause motion" in the footer)
stops every animation (saved as `chibi-motion`). Any button with
`data-motion-toggle` works and they stay in sync. Until a visitor chooses, the
OS "reduce motion" setting decides. Logic lives in `src/js/motion.js`.

## Sections and GSAP

Each homepage section is one module in `src/js/sections/`, loaded by
`src/js/sections.js` only when the section comes within about a screen of the
viewport:

```html
<section data-section="pictures">…</section>  <!-- runs src/js/sections/pictures.js -->
```

The module's default export gets the element; when it's done the element gets
`data-section-ready`. The built HTML is complete without it, so a failed
import leaves a working static section.

Sections never check the motion setting themselves. They hand their GSAP work
to `animateSection()` in `src/js/motion-controller.js`, which reverts every
section's GSAP context on each motion change and then rebuilds it or renders
the still state. GSAP and its plugins are imported on first use, so they're
not part of the first visit (and never load while motion is off). See the
comment at the top of that file for the API.

## Fonts and icons

- Fonts are self-hosted from `public/fonts/`: Latin-subset WOFF2s of Manrope
  (variable, 200–500), Space Mono 400/700 and Pirata One, with their OFL
  licences. No Google Fonts request.
- Social icons: inline SVGs from [Simple Icons](https://simpleicons.org) (CC0).
- Link preview: `public/og-image.jpg` (1200×630) is rendered from
  `scripts/og-image/og-image.html` with `sh scripts/og-image/render.sh` (needs
  Chrome). Its address and alt text live in `content.json` under `site.og`.
- Favicons: `public/favicon.svg` (day butterfly) and `public/favicon-night.svg`
  (night moth), swapped with the theme; `favicon.ico` and
  `apple-touch-icon.png` are the fallbacks.

## Current year

`src/js/current-year.js` keeps "this year" up to date, but only where you ask
it to, so project dates like "Place / 2026" stay put:

```html
<time data-current-year>2026</time>            <!-- becomes this year -->
<span data-years-since="1997">29</span> years  <!-- becomes years since 1997 -->
```

## Before and After

`public/scaffold.html` is the original Copilot scaffold, frozen with its own
copies of the CSS, JS, and favicon in `public/scaffold/`. Vite copies it as-is,
so it never picks up changes to the real site.
