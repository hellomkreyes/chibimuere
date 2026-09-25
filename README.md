# 🔮 chibi muere 💀

A static portfolio site for GitHub Pages.

## 💻 about the build

Built in collaboration with co-pilot. Co-pilot was in charge of the boring scaffold code, while I had more time to focus on the fun internet experiences and all the stupid content you'll find on the site.

Make friends with 🤖! You'll never know who your boss will be in the future. I hope my future boss is Keanu Reeves.

## running it

Built with [Vite](https://vite.dev) as a multi-page static site.

```sh
npm install
npm run dev      # local dev server with live reload
npm run build    # production build into dist/
npm run preview  # preview the production build
```

Pushing to `main` builds and deploys to GitHub Pages via `.github/workflows/deploy.yml`.

## content

Editable homepage and resume copy lives in `src/content.json`. Elements marked
with `data-copy` in the HTML get their copy baked in at build time by
`scripts/content-plugin.js` (and live in dev, reloading when the JSON changes).
The text in the HTML is just a placeholder; `content.json` wins.

## before / after

`public/scaffold.html` is the original Copilot scaffold, frozen with its own
copies of the CSS, JS, and favicon in `public/scaffold/`. Vite copies it as-is,
so it never picks up changes to the real site.
