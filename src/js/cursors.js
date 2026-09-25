/**
 * Custom cursors.
 *
 * Built as SVG once at load and handed to CSS `cursor:` through custom
 * properties — the OS draws them, so there's no lag and no JS per frame.
 * 32×32 keeps them within every browser's cursor size limit; browsers that
 * don't support SVG cursors fall back to the default arrow / pointer.
 */
const url = (svg, x, y, fallback) =>
  `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${x} ${y}, ${fallback}`;
const svg = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">${body}</svg>`;

// DAY — glass arrow: frosted translucent body, iridescent rim, specular highlight, soft shadow.
const ARROW = "M4 3 L4 23 L9.2 18.3 L12.6 26 L16 24.5 L12.7 17 L19.5 17 Z";
const glass = (bodyStops, sparkle) =>
  svg(`<defs>
    <linearGradient id="f" x1="0" y1="0" x2="1" y2="1">${bodyStops}</linearGradient>
    <linearGradient id="e" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7b8c8"/><stop offset=".35" stop-color="#f6e89a"/><stop offset=".65" stop-color="#a9d8f5"/><stop offset="1" stop-color="#cbb8f2"/></linearGradient>
    <filter id="s" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dy="1.5" stdDeviation="1.4" flood-color="#5a4e46" flood-opacity=".35"/></filter></defs>
    <path d="${ARROW}" fill="url(#f)" stroke="#5a4e46" stroke-opacity=".5" stroke-width="1.6" stroke-linejoin="round" filter="url(#s)"/>
    <path d="${ARROW}" fill="none" stroke="url(#e)" stroke-width="1" stroke-linejoin="round"/>
    <path d="M5.7 6.6 L5.7 13.5 L9.8 10.1 Z" fill="#fff" opacity=".95"/>
    ${sparkle ? '<path d="M24 3 L25 7 L29 8 L25 9 L24 13 L23 9 L19 8 L23 7 Z" fill="#fff" stroke="#e9b9c9" stroke-width=".6"/>' : ""}`);

// NIGHT — 1-bit pixel arrow, dithered fill, red/cyan channel split.
const PIXEL_MAP = [
  "X",
  "XX",
  "XOX",
  "XOOX",
  "XOOOX",
  "XOOOOX",
  "XOOOOOX",
  "XOOOOOOX",
  "XOOOOOOOX",
  "XOOOOXXXXX",
  "XOOXOOX",
  "XOX.XOOX",
  "XX..XOOX",
  "X....XOOX",
  ".....XOOX",
  "......XX",
];
const pixel = (fillA, fillB, split) => {
  const size = 2;
  const offsetX = 4;
  const offsetY = 1;
  let ghost = "";
  let outline = "";
  let fill = "";
  PIXEL_MAP.forEach((row, y) =>
    [...row].forEach((cell, x) => {
      if (cell === ".") return;
      const X = offsetX + x * size;
      const Y = offsetY + y * size;
      if (split && cell === "X") {
        ghost += `<rect x="${X - 1}" y="${Y}" width="2" height="2" fill="#ff2a4f"/><rect x="${X + 1}" y="${Y}" width="2" height="2" fill="#19e3f0"/>`;
      }
      if (cell === "X") outline += `<rect x="${X}" y="${Y}" width="2" height="2" fill="#000"/>`;
      else fill += `<rect x="${X}" y="${Y}" width="2" height="2" fill="${(x + y) % 2 ? fillB : fillA}"/>`;
    })
  );
  return svg(`<g shape-rendering="crispEdges"><g opacity=".75">${ghost}</g>${outline}${fill}</g>`);
};

export function initCursors() {
  if (!window.matchMedia("(pointer: fine)").matches) return; // touch screens have no cursor to dress up
  const set = (name, value) => document.documentElement.style.setProperty(name, value);

  set(
    "--cur-day",
    url(
      glass('<stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".55" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#f1e4f7" stop-opacity=".75"/>'),
      4,
      3,
      "auto"
    )
  );
  // Hover: the glass catches the light — rainbow-tinted body + a little sparkle.
  set(
    "--cur-day-hover",
    url(
      glass('<stop offset="0" stop-color="#fde2ea"/><stop offset=".4" stop-color="#fdf6d8"/><stop offset=".7" stop-color="#dcefff"/><stop offset="1" stop-color="#e6dcfb"/>', true),
      4,
      3,
      "pointer"
    )
  );
  set("--cur-night", url(pixel("#f0f0f5", "#a9a9b6", true), 4, 1, "auto"));
  set("--cur-night-hover", url(pixel("#ff2a4f", "#b3122f", false), 4, 1, "pointer"));
}
