/**
 * Custom cursors.
 *
 * Built as SVG once at load and handed to CSS `cursor:` through custom
 * properties — the OS draws them, so there's no lag and no JS per frame.
 * Drawn on a 32-unit grid and rendered at 48×48 (1.5x) so they're easier to
 * see. Chrome swaps cursors over 32px for the default arrow when they touch
 * the window edge; browsers that don't support SVG cursors fall back to the
 * default arrow / pointer.
 */
const SIZE = 48;
const SCALE = SIZE / 32;
// Hotspots are given in grid units and scaled to the rendered size.
const url = (svg, x, y, fallback) =>
  `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${Math.round(x * SCALE)} ${Math.round(y * SCALE)}, ${fallback}`;
const svg = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 32 32">${body}</svg>`;

// DAY — glass arrow: frosted translucent body, iridescent rim, specular highlight, soft shadow.
const ARROW = "M4 3 L4 23 L9.2 18.3 L12.6 26 L16 24.5 L12.7 17 L19.5 17 Z";
// Disabled: a little "no" sign tucked under the arrow's tail.
// Shadows are offset copies, not SVG filters: browsers don't reliably draw
// filters inside cursor images, and when the SVG is rejected the OS arrow shows.
const SHADOW = '<g fill="#5a4e46" fill-opacity=".3">';
const NOPE_DAY = `${SHADOW}<circle cx="23.5" cy="25" r="5.6"/></g><circle cx="23.5" cy="23.5" r="5.6" fill="#fff" stroke="#b5566f" stroke-width="1.8"/><path d="M19.6 27.4 27.4 19.6" stroke="#b5566f" stroke-width="1.8" stroke-linecap="round"/>`;
const glass = (bodyStops, sparkle, badge = "") =>
  svg(`<defs>
    <linearGradient id="f" x1="0" y1="0" x2="1" y2="1">${bodyStops}</linearGradient>
    <linearGradient id="e" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7b8c8"/><stop offset=".35" stop-color="#f6e89a"/><stop offset=".65" stop-color="#a9d8f5"/><stop offset="1" stop-color="#cbb8f2"/></linearGradient></defs>
    ${SHADOW}<path d="${ARROW}" transform="translate(0 1.5)"/></g>
    <path d="${ARROW}" fill="url(#f)" stroke="#5a4e46" stroke-opacity=".5" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="${ARROW}" fill="none" stroke="url(#e)" stroke-width="1" stroke-linejoin="round"/>
    <path d="M5.7 6.6 L5.7 13.5 L9.8 10.1 Z" fill="#fff" opacity=".95"/>
    ${sparkle ? '<path d="M24 3 L25 7 L29 8 L25 9 L24 13 L23 9 L19 8 L23 7 Z" fill="#fff" stroke="#e9b9c9" stroke-width=".6"/>' : ""}
    ${badge}`);

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
// Disabled at night: a red pixel X in the bottom-right corner.
const NOPE_NIGHT = (() => {
  const points = [];
  for (let i = 0; i < 5; i++) points.push([19 + i * 2, 19 + i * 2], [27 - i * 2, 19 + i * 2]);
  // Black outline first, then the red X on top, so neighbours don't cover each other.
  const outline = points.map(([x, y]) => `<rect x="${x - 1}" y="${y - 1}" width="5" height="5" fill="#000"/>`).join("");
  const cross = points.map(([x, y]) => `<rect x="${x}" y="${y}" width="3" height="3" fill="#ff2a4f"/>`).join("");
  return outline + cross;
})();
const pixel = (fillA, fillB, split, badge = "") => {
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
  return svg(`<g shape-rendering="crispEdges"><g opacity=".75">${ghost}</g>${outline}${fill}${badge}</g>`);
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
  // Disabled: the frosted arrow goes dull and gets a "no" sign.
  set(
    "--cur-day-disabled",
    url(
      glass('<stop offset="0" stop-color="#ece6e2" stop-opacity=".95"/><stop offset="1" stop-color="#d9d0cc" stop-opacity=".9"/>', false, NOPE_DAY),
      4,
      3,
      "not-allowed"
    )
  );
  set("--cur-night", url(pixel("#f0f0f5", "#a9a9b6", true), 4, 1, "auto"));
  set("--cur-night-hover", url(pixel("#ff2a4f", "#b3122f", false), 4, 1, "pointer"));
  set("--cur-night-disabled", url(pixel("#5d5a66", "#3a3844", false, NOPE_NIGHT), 4, 1, "not-allowed"));
}
