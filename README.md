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
```

Pushing to `main` builds and deploys to GitHub Pages via `.github/workflows/deploy.yml`.

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
```

Keys starting with `site.` read the shared section; anything else reads the
page's own. List templates use `{{field}}`, `{{#field}}…{{/field}}` (only when
set), `{{^field}}…{{/field}}` (only when not) and `{{@num}}` (01, 02, …); items
with `"show": false` are skipped.

Project cards: `link` makes the title clickable and `writeup` adds a "Read the
write-up" link (for the Substack case study or devlog). Both are optional.
Add `"newTab": true` to open the title link in a new tab, for links that leave
the site, such as a GitHub repo. Write-up links always open in a new tab.

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

## Fonts and icons

- Fonts are self-hosted from `public/fonts/`: Latin-subset WOFF2s of Manrope
  (variable, 200–500), Space Mono 400/700 and Pirata One, with their OFL
  licences. No Google Fonts request.
- Social icons: inline SVGs from [Simple Icons](https://simpleicons.org) (CC0).
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
