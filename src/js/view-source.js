/**
 * View source: outlines the page's landmarks, sections and headings and labels
 * each one with its own tag, e.g. <section id="artsy"> … </section>.
 *
 * Toggle with a [data-view-source] button (the </> in the header) or the
 * backtick key; Escape closes it. Nothing is measured or drawn until it's
 * switched on.
 *
 * The labels are drawn in two overlay layers instead of on the elements, so no
 * element's position or ::before / ::after is touched (the night title and the
 * card links already use theirs):
 *   .vs-layer        absolute, in page coordinates, under the header
 *   .vs-layer-fixed  fixed, for things inside the fixed header / bottom bar
 * Both are aria-hidden; a polite status line says when the mode turns on/off.
 */
import { ui } from "./copy.js";

const root = document.documentElement;
const TAGGED = "header, nav, main, section, article, aside, footer, h1, h2, h3, figure, [role='dialog']";
const CLOSES = new Set(["main", "section", "article"]);
const SKIP = ".fx-layers, .vs-layer, .vs-layer-fixed, [hidden], [inert], [aria-hidden='true']";

let buttons = [];
let layer = null;
let fixedLayer = null;
let toast = null;
let status = null;
let tagged = [];
let redrawQueued = false;
let resizeObserver = null;
let themeObserver = null;

const isOn = () => root.dataset.viewSource === "on";

function quote(value, max = 32) {
  const text = value.trim().replace(/\s+/g, " ");
  return `"${text.length > max ? `${text.slice(0, max - 1)}…` : text}"`;
}

// <tag id="…"> if it has an id, else <tag aria-label="…">, else its first class.
function openingTag(element) {
  const tag = element.tagName.toLowerCase();
  const role = element.getAttribute("role");
  if (element.id) return `<${tag} id=${quote(element.id)}>`;
  if (element.getAttribute("aria-label")) return `<${tag}${role ? ` role="${role}"` : ""} aria-label=${quote(element.getAttribute("aria-label"))}>`;
  const firstClass = element.classList[0];
  return `<${tag}${role ? ` role="${role}"` : ""}${firstClass ? ` class="${firstClass}"` : ""}>`;
}

function inFixedBox(element) {
  for (let node = element; node && node !== document.body; node = node.parentElement) {
    if (getComputedStyle(node).position === "fixed") return true;
  }
  return false;
}

function makeLabel(text, closing = false) {
  const label = document.createElement("span");
  label.className = closing ? "vs-label vs-label-close" : "vs-label";
  label.textContent = text;
  return label;
}

function overlaps(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function draw() {
  redrawQueued = false;
  if (!isOn()) return;
  layer.replaceChildren();
  fixedLayer.replaceChildren();
  tagged.forEach((element) => element.removeAttribute("data-vs-tagged"));
  tagged = [];

  const placed = { page: [], fixed: [] };
  const pageWidth = document.documentElement.clientWidth;

  for (const element of document.querySelectorAll(TAGGED)) {
    if (element.closest(SKIP)) continue;
    const rect = element.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2 || getComputedStyle(element).visibility === "hidden") continue;

    const fixed = inFixedBox(element);
    const target = fixed ? fixedLayer : layer;
    const offsetY = fixed ? 0 : window.scrollY;
    const offsetX = fixed ? 0 : window.scrollX;
    element.setAttribute("data-vs-tagged", "");
    tagged.push(element);

    const open = makeLabel(openingTag(element));
    target.append(open);
    const height = open.offsetHeight;
    const width = open.offsetWidth;
    let left = Math.max(2, Math.min(rect.left + offsetX, pageWidth - width - 2));
    let top = Math.max(0, rect.top + offsetY - height);
    // Nested elements often share a corner (main + its first section): step right until the label is clear.
    const boxes = placed[fixed ? "fixed" : "page"];
    for (let tries = 0; tries < 12; tries++) {
      const box = { left, top, right: left + width, bottom: top + height };
      const hit = boxes.find((other) => overlaps(box, other));
      if (!hit) break;
      left = hit.right + 4;
      if (left + width > pageWidth) {
        left = Math.max(2, rect.left + offsetX);
        top = hit.bottom + 1;
      }
    }
    open.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
    boxes.push({ left, top, right: left + width, bottom: top + height });

    if (CLOSES.has(element.tagName.toLowerCase())) {
      const close = makeLabel(`</${element.tagName.toLowerCase()}>`, true);
      target.append(close);
      const closeLeft = Math.max(2, Math.min(rect.right + offsetX - close.offsetWidth, pageWidth - close.offsetWidth - 2));
      const closeTop = rect.bottom + offsetY - close.offsetHeight;
      close.style.transform = `translate(${Math.round(closeLeft)}px, ${Math.round(closeTop)}px)`;
    }
  }
}

function queueDraw() {
  if (redrawQueued || !isOn()) return;
  redrawQueued = true;
  requestAnimationFrame(draw);
}

// The header changes shape (menu open, night's ruled bar) without resizing the body.
function onTransitionEnd(event) {
  if (event.target instanceof Element && event.target.closest(".site-header")) queueDraw();
}

function ensureLayers() {
  if (layer) return;
  layer = Object.assign(document.createElement("div"), { className: "vs-layer" });
  fixedLayer = Object.assign(document.createElement("div"), { className: "vs-layer-fixed" });
  toast = Object.assign(document.createElement("p"), { className: "vs-toast", hidden: true });
  toast.innerHTML = `<span class="vs-toast-key"></span><span class="vs-toast-touch"></span>`;
  toast.querySelector(".vs-toast-key").textContent = ui("viewSourceHint", "view source · press ` or Esc to close");
  toast.querySelector(".vs-toast-touch").textContent = ui("viewSourceHintTouch", "view source · tap </> to close");
  [layer, fixedLayer, toast].forEach((node) => node.setAttribute("aria-hidden", "true"));
  status = Object.assign(document.createElement("p"), { className: "visually-hidden" });
  status.setAttribute("role", "status");
  document.body.append(layer, fixedLayer, toast, status);
}

function set(on) {
  if (on === isOn()) return;
  ensureLayers();
  root.dataset.viewSource = on ? "on" : "off";
  buttons.forEach((button) => button.setAttribute("aria-pressed", String(on)));
  toast.hidden = !on;
  status.textContent = on
    ? ui("viewSourceOn", "View source on: the page's sections and headings are outlined with their HTML tags. Press Escape to close.")
    : ui("viewSourceOff", "View source off.");

  if (on) {
    draw();
    resizeObserver ??= new ResizeObserver(queueDraw);
    resizeObserver.observe(document.body);
    themeObserver ??= new MutationObserver(queueDraw);
    themeObserver.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    window.addEventListener("resize", queueDraw);
    document.addEventListener("transitionend", onTransitionEnd);
  } else {
    resizeObserver?.disconnect();
    themeObserver?.disconnect();
    window.removeEventListener("resize", queueDraw);
    document.removeEventListener("transitionend", onTransitionEnd);
    layer.replaceChildren();
    fixedLayer.replaceChildren();
    tagged.forEach((element) => element.removeAttribute("data-vs-tagged"));
    tagged = [];
  }
}

function typing(target) {
  return target instanceof Element && target.closest("input, textarea, select, [contenteditable='true'], [contenteditable='']");
}

export function initViewSource() {
  buttons = [...document.querySelectorAll("[data-view-source]")];
  if (!buttons.length) return;
  buttons.forEach((button) => button.addEventListener("click", () => set(!isOn())));
  document.addEventListener("keydown", (event) => {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || typing(event.target)) return;
    if (event.key === "`") {
      event.preventDefault();
      set(!isOn());
    } else if (event.key === "Escape" && isOn()) {
      set(false);
    }
  });
}
