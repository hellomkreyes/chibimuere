/**
 * Dream Collabs ship chart: chibimuere at the centre, every collab on a ring
 * around it. Canon ships get a solid line and a heart; fanon ones a thin
 * dashed line and a sparkle, so the difference never relies on colour. Each
 * node is a real button; picking one shows its details (and, if it's canon,
 * a little heart burst).
 *
 * The chart is built from the list of collabs the page already holds (any
 * number of them), so without JS the list is simply what you read. Lines
 * grow out from the centre and the nodes pop in the first time the chart
 * loads; both go through the motion controller, so with motion off the
 * finished chart just appears.
 */
import { animateSection } from "../motion-controller.js";

const SVG = "http://www.w3.org/2000/svg";
const RX = 37; // ring radius, as % of the chart's width and height
const RY = 36;
const GLYPHS = {
  heart: { day: "M10 18S1 12 1 6.5A4.5 4.5 0 0 1 10 4a4.5 4.5 0 0 1 9 2.5C19 12 10 18 10 18z", night: "M3 3h5v2h4V3h5v5h-2v3h-2v3h-2v3H9v-3H7v-3H5V8H3z" },
  sparkle: { day: "M10 0l2.4 7.6L20 10l-7.6 2.4L10 20l-2.4-7.6L0 10l7.6-2.4z", night: "M7 0h6v7h7v6h-7v7H7v-7H0V7h7z" },
};

function glyph(kind, className) {
  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("class", className);
  svg.setAttribute("viewBox", "0 0 20 20");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  for (const theme of ["day", "night"]) {
    const path = document.createElementNS(SVG, "path");
    path.setAttribute("class", `${theme}-only`);
    path.setAttribute("d", GLYPHS[kind][theme]);
    svg.append(path);
  }
  return svg;
}

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

export default function initCollabs(ship) {
  const chart = ship.querySelector("[data-ship-chart]");
  const panel = ship.querySelector("[data-ship-panel]");
  const detail = ship.querySelector("[data-ship-detail]");
  const list = ship.querySelector("[data-ship-list]");
  const items = [...ship.querySelectorAll("[data-ship]")];
  if (!chart || !panel || !items.length) return;

  const { center = "chibimuere", canon: canonWord = "canon", fanon: fanonWord = "fanon", canonChip = "it’s canon!!", chartLabel = "" } = ship.dataset;
  const collabs = items.map((item) => ({
    item,
    canon: item.hasAttribute("data-canon"),
    nameHtml: item.querySelector(".ship-name").innerHTML,
    name: item.dataset.name,
    tags: (item.dataset.tags || "").split(",").map((tag) => tag.trim()).filter(Boolean),
    why: item.querySelector(".ship-why"),
    action: item.querySelector(".ship-cta, .ship-link"),
  }));

  // Chart: lines under, then the nodes
  const lines = document.createElementNS(SVG, "svg");
  lines.setAttribute("class", "ship-lines");
  lines.setAttribute("aria-hidden", "true");
  const slots = el("ul");
  slots.style.cssText = "margin:0;padding:0;list-style:none";
  slots.setAttribute("role", "list");
  const nodes = [];
  const lineEls = [];

  collabs.forEach((collab, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / collabs.length;
    collab.x = +(50 + Math.cos(angle) * RX).toFixed(2);
    collab.y = +(50 + Math.sin(angle) * RY).toFixed(2);

    const line = document.createElementNS(SVG, "line");
    line.setAttribute("class", `ship-line${collab.canon ? " is-canon" : ""}`);
    line.setAttribute("x1", "50%");
    line.setAttribute("y1", "50%");
    line.setAttribute("x2", `${collab.x}%`);
    line.setAttribute("y2", `${collab.y}%`);
    lines.append(line);
    lineEls.push(line);

    const slot = el("li");
    slot.style.cssText = `position:absolute;left:${collab.x}%;top:${collab.y}%;width:max-content;transform:translate(-50%,-50%)`;
    const node = el("button", `ship-node${collab.canon ? " is-canon" : ""}`);
    node.type = "button";
    node.setAttribute("aria-pressed", "false");
    node.setAttribute("aria-label", `${collab.name}, ${collab.canon ? canonWord : fanonWord}`);
    node.append(glyph(collab.canon ? "heart" : "sparkle", "ship-glyph"));
    const label = el("span", "ship-label");
    label.innerHTML = collab.nameHtml;
    node.append(label);
    node.addEventListener("click", () => select(i));
    slot.append(node);
    slots.append(slot);
    nodes.push(node);
  });

  const centre = el("div", "ship-node ship-center");
  centre.style.cssText = "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)";
  centre.append(glyph("sparkle", "ship-glyph"), el("span", "ship-label", center));
  chart.setAttribute("role", "group");
  if (chartLabel) chart.setAttribute("aria-label", chartLabel);
  chart.append(lines, centre, slots);

  let selected = -1;
  const motion = animateSection(chart, {
    animate(gsap) {
      gsap.from(lineEls, { attr: { x2: "50%", y2: "50%" }, duration: 1, delay: 0.3, stagger: 0.12, ease: "power2.inOut" });
      gsap.from(nodes, { autoAlpha: 0, scale: 0.3, duration: 0.5, delay: 0.7, stagger: 0.12, ease: "back.out(2)" });
    },
  });

  function showDetail(collab) {
    const name = el("h4", "ship-name");
    name.innerHTML = collab.nameHtml;
    const status = el("div", "ship-chip-row");
    status.append(el("span", `ship-chip is-status${collab.canon ? " is-canon" : ""}`, collab.canon ? canonWord : fanonWord));
    if (collab.canon) status.append(el("span", "ship-chip", canonChip));
    const tags = el("div", "ship-chip-row");
    collab.tags.forEach((tag) => tags.append(el("span", "ship-chip", tag)));
    const parts = [name, status, tags, collab.why.cloneNode(true)];
    if (collab.action) parts.push(collab.action.cloneNode(true));
    detail.replaceChildren(...parts);
  }

  async function burst(collab) {
    await motion.play((gsap, onRevert) => {
      const hearts = Array.from({ length: 8 }, (_, k) => {
        const heart = glyph("heart", "ship-burst");
        heart.style.left = `${(50 + collab.x) / 2}%`;
        heart.style.top = `${(50 + collab.y) / 2}%`;
        chart.append(heart);
        return heart;
      });
      onRevert(() => hearts.forEach((heart) => heart.remove()));
      return gsap.fromTo(
        hearts,
        { x: 0, y: 0, scale: 0.2, autoAlpha: 1 },
        {
          x: (k) => Math.round(Math.cos((k * Math.PI) / 4) * 70),
          y: (k) => Math.round(Math.sin((k * Math.PI) / 4) * 70),
          scale: 1,
          autoAlpha: 0,
          duration: 1.2,
          ease: "power3.out",
          onComplete: () => hearts.forEach((heart) => heart.remove()),
        }
      );
    });
  }

  function select(index, { celebrate = true } = {}) {
    selected = index;
    collabs.forEach((collab, i) => {
      nodes[i].setAttribute("aria-pressed", String(i === index));
      lineEls[i].classList.toggle("is-on", i === index);
    });
    showDetail(collabs[index]);
    if (celebrate && collabs[index].canon) burst(collabs[index]);
  }

  list.hidden = true;
  chart.hidden = false;
  panel.hidden = false;
  select(0, { celebrate: false });
}
