# 🔮 chibi muere 💀

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

Editable homepage and resume copy lives in `src/content.json`. Elements marked
with `data-copy` in the HTML get their copy baked in at build time by
`scripts/content-plugin.js` (and live in dev, reloading when the JSON changes).
The text in the HTML is just a placeholder; `content.json` wins.

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
- `src/js/nav.js`: the mobile menu and the frosted header on scroll.

Show something in only one theme with `class="day-only"` or `class="night-only"`.

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
