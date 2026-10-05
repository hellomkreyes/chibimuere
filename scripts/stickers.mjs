/*
 * Resume page stickers: draws each sticker twice (a cute day version, a gothy
 * night version) into public/stickers/<name>-<day|night>.svg.
 *
 *   npm run stickers
 *
 * Each file is a flat die-cut sticker: a thick outline, the artwork, and a few
 * sparkles. There is no animation inside the files: the holographic shimmer is
 * a CSS layer clipped to the sticker's own silhouette (see "Resume stickers" in
 * src/styles/main.css), driven by src/js/sections/stickers.js, so Pause Motion
 * and reduced motion can switch it off. To change a sticker, edit it here and
 * run the script again.
 */
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "public/stickers";
const BORDER = { day: "#ffffff", night: "#4b4357" };

const attrs = (a) => Object.entries(a).map(([k, v]) => `${k}="${v}"`).join(" ");
const star = (x, y, r, fill) => ({
  tag: "path",
  a: { d: `M${x} ${y - r}L${x + r * 0.28} ${y - r * 0.28}L${x + r} ${y}L${x + r * 0.28} ${y + r * 0.28}L${x} ${y + r}L${x - r * 0.28} ${y + r * 0.28}L${x - r} ${y}L${x - r * 0.28} ${y - r * 0.28}Z`, fill },
});
const P = (d, a = {}, o = {}) => ({ tag: "path", a: { d, ...a }, ...o });
const C = (cx, cy, r, a = {}, o = {}) => ({ tag: "circle", a: { cx, cy, r, ...a }, ...o });
const E = (cx, cy, rx, ry, a = {}, o = {}) => ({ tag: "ellipse", a: { cx, cy, rx, ry, ...a }, ...o });
const R = (x, y, w, h, rx, a = {}, o = {}) => ({ tag: "rect", a: { x, y, width: w, height: h, rx, ...a }, ...o });
const L = (d, c, w, o = {}) => P(d, { fill: "none", stroke: c, "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round" }, o);

// ol: 1 = the shape also draws the sticker's die-cut outline
const STICKERS = {
  cursor: {
    day: () => [
      P("M30 40C8 24 4 46 22 54C12 58 18 70 34 60Z", { fill: "#fff6fb", stroke: "#e9b4d4", "stroke-width": 1.5 }, { ol: 1 }),
      P("M62 36C86 20 96 42 78 50C90 56 80 68 64 58Z", { fill: "#fff6fb", stroke: "#e9b4d4", "stroke-width": 1.5 }, { ol: 1 }),
      P("M30 12L30 76L46 62L56 86L68 80L58 57L79 56Z", { fill: "#ffb7d9", stroke: "#e07fb0", "stroke-width": 2 }, { ol: 1 }),
      star(84, 18, 7, "#ffd36b"), star(14, 74, 5, "#b9a3ff"), star(80, 86, 4, "#ff9cc6"),
    ],
    night: () => [
      P("M30 42C6 30 2 52 18 56C10 62 20 72 34 62Z", { fill: "#2a1b3a", stroke: "#ff2a4f", "stroke-width": 1.5 }, { ol: 1 }),
      P("M64 38C90 26 98 48 82 52C92 60 82 70 66 60Z", { fill: "#2a1b3a", stroke: "#ff2a4f", "stroke-width": 1.5 }, { ol: 1 }),
      P("M30 12L30 76L46 62L56 86L68 80L58 57L79 56Z", { fill: "#14101a", stroke: "#ff2a4f", "stroke-width": 2.5 }, { ol: 1 }),
      star(84, 18, 7, "#19e3f0"), star(14, 76, 5, "#ff2a4f"), star(78, 88, 4, "#e8e4ee"),
    ],
  },
  brackets: {
    day: () => [
      L("M36 26L12 50L36 74", "#b9a3ff", 10, { ol: 1 }), L("M64 26L88 50L64 74", "#b9a3ff", 10, { ol: 1 }),
      P("M50 66C30 52 36 38 44 40C48 41 50 45 50 45C50 45 52 41 56 40C64 38 70 52 50 66Z", { fill: "#ff9cc6", stroke: "#e07fb0", "stroke-width": 1.5 }, { ol: 1 }),
      star(50, 16, 6, "#ffd36b"), star(18, 84, 5, "#ff9cc6"), star(86, 80, 5, "#b9a3ff"),
    ],
    night: () => [
      L("M36 26L12 50L36 74", "#ff2a4f", 10, { ol: 1 }), L("M64 26L88 50L64 74", "#ff2a4f", 10, { ol: 1 }),
      C(50, 46, 12, { fill: "#e7e7ee" }, { ol: 1 }), R(44, 54, 12, 10, 2, { fill: "#e7e7ee" }, { ol: 1 }),
      C(45.5, 46, 3.2, { fill: "#07060a" }), C(54.5, 46, 3.2, { fill: "#07060a" }), P("M50 51L48.5 54H51.5Z", { fill: "#07060a" }),
      star(50, 14, 6, "#19e3f0"), star(16, 86, 5, "#ff2a4f"),
    ],
  },
  browser: {
    day: () => [
      R(12, 18, 76, 64, 9, { fill: "#fffdfb", stroke: "#c9b8ff", "stroke-width": 2 }, { ol: 1 }),
      P("M12 36V27A9 9 0 0 1 21 18H79A9 9 0 0 1 88 27V36Z", { fill: "#ffd6e8" }),
      C(23, 27, 2.8, { fill: "#ff9cc6" }), C(32, 27, 2.8, { fill: "#ffc98f" }), C(41, 27, 2.8, { fill: "#9fe3c0" }),
      C(38, 56, 3.6, { fill: "#5a3a52" }), C(62, 56, 3.6, { fill: "#5a3a52" }),
      E(31, 63, 5, 3, { fill: "#ffb3cf", opacity: 0.8 }), E(69, 63, 5, 3, { fill: "#ffb3cf", opacity: 0.8 }),
      L("M44 64Q50 70 56 64", "#5a3a52", 2.5), star(90, 16, 6, "#ffd36b"), star(10, 84, 5, "#b9a3ff"),
    ],
    night: () => [
      R(12, 18, 76, 64, 5, { fill: "#17131d", stroke: "#ff2a4f", "stroke-width": 2.5 }, { ol: 1 }),
      P("M12 36V23A5 5 0 0 1 17 18H83A5 5 0 0 1 88 23V36Z", { fill: "#2a1b3a" }),
      C(23, 27, 2.8, { fill: "#ff2a4f" }), C(32, 27, 2.8, { fill: "#19e3f0" }), C(41, 27, 2.8, { fill: "#e8e4ee" }),
      L("M32 50L42 60M42 50L32 60", "#e8e4ee", 3), L("M58 50L68 60M68 50L58 60", "#e8e4ee", 3), L("M40 70H60", "#ff2a4f", 2.5),
      star(90, 16, 6, "#19e3f0"), star(10, 84, 5, "#ff2a4f"),
    ],
  },
  brew: {
    day: () => [
      P("M20 42H76V60C76 76 64 86 48 86C32 86 20 76 20 60Z", { fill: "#fffdfb", stroke: "#e9b4d4", "stroke-width": 2 }, { ol: 1 }),
      C(80, 54, 9, { fill: "none", stroke: "#e9b4d4", "stroke-width": 5 }, { ol: 1 }),
      L("M36 34C30 28 42 24 36 14", "#c9b8ff", 3), L("M52 34C46 28 58 24 52 14", "#ffb7d9", 3),
      C(38, 62, 3.2, { fill: "#5a3a52" }), C(58, 62, 3.2, { fill: "#5a3a52" }),
      E(30, 69, 4.5, 2.8, { fill: "#ffb3cf", opacity: 0.8 }), E(66, 69, 4.5, 2.8, { fill: "#ffb3cf", opacity: 0.8 }),
      L("M44 70Q48 74 52 70", "#5a3a52", 2.2), star(88, 22, 6, "#ffd36b"),
    ],
    night: () => [
      P("M16 42H80C84 64 72 86 48 86C24 86 12 64 16 42Z", { fill: "#14101a", stroke: "#ff2a4f", "stroke-width": 2.5 }, { ol: 1 }),
      E(48, 42, 32, 7, { fill: "#2a1b3a", stroke: "#ff2a4f", "stroke-width": 2 }, { ol: 1 }),
      C(38, 28, 5, { fill: "#19e3f0", opacity: 0.9 }), C(54, 22, 3.5, { fill: "#19e3f0", opacity: 0.9 }), C(60, 32, 4, { fill: "#e8e4ee", opacity: 0.9 }),
      L("M30 86L26 94M66 86L70 94", "#ff2a4f", 3, { ol: 1 }), star(86, 18, 6, "#ff2a4f"),
    ],
  },
  floppy: {
    day: () => [
      P("M16 16H72L86 30V86H16Z", { fill: "#c9b8ff", stroke: "#9b86e6", "stroke-width": 2 }, { ol: 1 }),
      R(30, 16, 34, 22, 2, { fill: "#f0eaff" }), R(52, 20, 8, 14, 1.5, { fill: "#c9b8ff" }), R(24, 50, 52, 32, 3, { fill: "#fffdfb" }),
      P("M50 74C38 66 40 58 45 59C48 60 50 62 50 62C50 62 52 60 55 59C60 58 62 66 50 74Z", { fill: "#ff9cc6" }),
      star(88, 14, 6, "#ffd36b"), star(10, 86, 5, "#ff9cc6"),
    ],
    night: () => [
      P("M16 16H72L86 30V86H16Z", { fill: "#1b1622", stroke: "#ff2a4f", "stroke-width": 2.5 }, { ol: 1 }),
      R(30, 16, 34, 22, 2, { fill: "#3a3340" }), R(52, 20, 8, 14, 1.5, { fill: "#ff2a4f" }), R(24, 50, 52, 32, 3, { fill: "#e8e4ee" }),
      C(50, 63, 8, { fill: "#14101a" }), R(46, 69, 8, 6, 1.5, { fill: "#14101a" }), C(47, 63, 2, { fill: "#e8e4ee" }), C(53, 63, 2, { fill: "#e8e4ee" }),
      star(88, 14, 6, "#19e3f0"), star(10, 86, 5, "#ff2a4f"),
    ],
  },
  prompt: {
    day: () => [
      R(14, 14, 72, 72, 18, { fill: "#e7dcff", stroke: "#b9a3ff", "stroke-width": 2 }, { ol: 1 }),
      L("M32 38L48 50L32 62", "#7a5cd6", 7), L("M54 66H70", "#7a5cd6", 7), star(74, 28, 8, "#ffd36b"), star(24, 76, 4, "#ff9cc6"),
    ],
    night: () => [
      // A crescent: the outer arc is cut back by a flatter inner arc (both need radii above half the chord).
      P("M66 10A42 42 0 1 0 66 90A50 50 0 0 1 66 10Z", { fill: "#14101a", stroke: "#4de1f0", "stroke-width": 2.5 }, { ol: 1 }),
      L("M22 40L33 50L22 60", "#19e3f0", 5), L("M37 63H47", "#19e3f0", 5), star(80, 22, 7, "#ff2a4f"), star(86, 74, 4, "#e8e4ee"),
    ],
  },
  butterfly: {
    day: () => [
      P("M50 50C30 10 2 18 8 42C2 60 22 80 50 56Z", { fill: "#ffb7d9", stroke: "#e07fb0", "stroke-width": 1.5 }, { ol: 1 }),
      P("M50 50C70 10 98 18 92 42C98 60 78 80 50 56Z", { fill: "#c9b8ff", stroke: "#9b86e6", "stroke-width": 1.5 }, { ol: 1 }),
      R(48, 28, 4, 42, 2, { fill: "#6e3f52" }, { ol: 1 }), L("M49 30Q44 18 38 16", "#6e3f52", 1.8), L("M51 30Q56 18 62 16", "#6e3f52", 1.8),
      star(14, 14, 6, "#ffd36b"), star(88, 84, 5, "#ff9cc6"),
    ],
    night: () => [
      P("M50 50C30 10 2 18 8 42C2 60 22 80 50 56Z", { fill: "#19e3f0", opacity: 0.7, transform: "translate(2 0)" }),
      P("M50 50C70 10 98 18 92 42C98 60 78 80 50 56Z", { fill: "#ff2a4f", opacity: 0.7, transform: "translate(-2 0)" }),
      P("M50 50C30 10 2 18 8 42C2 60 22 80 50 56Z", { fill: "#e8e4ee", stroke: "#2a1b3a", "stroke-width": 1.5 }, { ol: 1 }),
      P("M50 50C70 10 98 18 92 42C98 60 78 80 50 56Z", { fill: "#e8e4ee", stroke: "#2a1b3a", "stroke-width": 1.5 }, { ol: 1 }),
      R(48, 28, 4, 42, 2, { fill: "#07060a" }, { ol: 1 }), L("M49 30Q44 18 38 16", "#e8e4ee", 1.8), L("M51 30Q56 18 62 16", "#e8e4ee", 1.8),
      star(14, 14, 6, "#19e3f0"), star(88, 84, 5, "#ff2a4f"),
    ],
  },
};

function svg(shapes, theme) {
  const border = BORDER[theme];
  const outline = shapes
    .filter((s) => s.ol)
    .map((s) => {
      const a = { ...s.a };
      const filled = a.fill && a.fill !== "none";
      a.fill = filled ? border : "none";
      a.stroke = border;
      a["stroke-width"] = (+a["stroke-width"] || 0) + 10;
      a["stroke-linejoin"] = "round";
      a["stroke-linecap"] = "round";
      delete a.opacity;
      return `<${s.tag} ${attrs(a)}/>`;
    });
  const art = shapes.map((s) => `<${s.tag} ${attrs(s.a)}/>`);
  // The outline and its offset reach past the 100x100 artboard, so the box is padded.
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-8 -8 116 116" width="116" height="116">\n${[...outline, ...art].join("\n")}\n</svg>\n`;
}

mkdirSync(OUT, { recursive: true });
for (const [name, themes] of Object.entries(STICKERS)) {
  for (const theme of ["day", "night"]) {
    writeFileSync(`${OUT}/${name}-${theme}.svg`, svg(themes[theme](), theme));
  }
}
console.log(`Wrote ${Object.keys(STICKERS).length * 2} stickers to ${OUT}/`);
