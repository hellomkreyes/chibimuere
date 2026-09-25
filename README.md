# 🔮 chibi muere 💀

A static portfolio site for GitHub Pages.

## 💻 about the build

Built in collaboration with co-pilot. Co-pilot was in charge of the boring scaffold code, while I had more time to focus on the fun internet experiences and all the stupid content you'll find on the site.

Make friends with 🤖! You'll never know who your boss will be in the future. I hope my future boss is Keanu Reeves.

## content

Editable homepage and resume copy lives in `assets/content.json`. Elements marked
with `data-copy` in the HTML are hydrated by `assets/script.js`, with the text in
the HTML kept as a no-JavaScript fallback.

Because the content file is loaded with `fetch`, preview the site through a
local web server rather than opening the HTML files directly. For example:

```sh
python3 -m http.server
```
