/**
 * Bio messenger winks: butterfly swarm (a moth flutter at night), moon
 * sparkles and emoji swarm, from content.json home.bio.winks.
 *
 * Every wink adds "You have sent a wink: …" to the conversation log (a polite
 * live region). With motion on it also plays a ~3 s timeline in a fixed,
 * aria-hidden overlay that never catches clicks, with a Skip button. With
 * motion off (or paused mid-wink) there's no overlay, only the log line.
 */
import { animateSection } from "../motion-controller.js";
import { addLogLine } from "../nudge.js";
import { ui } from "../copy.js";

const SVG = "http://www.w3.org/2000/svg";
const STAR = "M10 0l2.5 7.5L20 10l-7.5 2.5L10 20l-2.5-7.5L0 10l7.5-2.5z";
const BUTTERFLY = [
  "M32 32C22 10 4 12 8 26c3 9 14 8 24 6zM32 32c10-22 28-20 24-6-3 9-14 8-24 6zM32 32c-8 14-20 18-20 8 0-6 10-8 20-8zM32 32c8 14 20 18 20 8 0-6-10-8-20-8z",
];
const MOTH = [
  "M32 30C18 12 2 18 6 30c4 10 16 8 26 0zM32 30c14-18 30-12 26 0-4 10-16 8-26 0zM32 32c-6 10-16 16-18 10s8-10 18-10zM32 32c6 10 16 16 18 10s-8-10-18-10z",
];
// A crescent: the outer arc of a 42-radius circle, cut back by a flatter inner arc.
const MOON = "M64.4 10.5A42 42 0 1 0 64.4 89.5A46 46 0 0 1 64.4 10.5z";

// Where each flyer rises from (% across the screen) and when it starts (s).
const SPOTS = [
  [6, 0],
  [19, 0.3],
  [33, 0.1],
  [47, 0.45],
  [61, 0.2],
  [75, 0.5],
  [88, 0.15],
];
const STARS = [
  [22, 24, 0.6, 1],
  [72, 20, 0.9, 2],
  [30, 70, 1.1, 3],
  [66, 66, 0.75, 1],
];

const isNight = () => document.documentElement.dataset.theme === "night";

function svg(className, viewBox, paths, styles) {
  const el = document.createElementNS(SVG, "svg");
  el.setAttribute("class", className);
  el.setAttribute("viewBox", viewBox);
  paths.forEach((d, i) => {
    const path = document.createElementNS(SVG, "path");
    path.setAttribute("d", d);
    path.setAttribute("style", styles[i] ?? styles[0]);
    el.append(path);
  });
  return el;
}

function flyerFor(kind, index, glyphs) {
  if (kind === "emoji") {
    const span = document.createElement("span");
    span.className = "wink-emoji";
    span.textContent = glyphs[index % glyphs.length];
    return span;
  }
  if (kind === "moths") return svg("wink-flyer wink-moth", "0 0 64 64", MOTH, ["fill: #e8e4ee"]);
  return svg("wink-flyer", "0 0 64 64", BUTTERFLY, [`fill: var(--wink-${(index % 3) + 1})`]);
}

/** Builds the overlay contents and the timeline for one wink. */
function buildWink(gsap, overlay, kind, glyphs) {
  const tl = gsap.timeline();
  tl.fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0);

  if (kind === "moon") {
    const moon = svg("wink-moon", "0 0 100 100", [MOON], ["fill: var(--wink-3)"]);
    overlay.append(moon);
    tl.fromTo(moon, { y: 420, scale: 0.6, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 1.2, ease: "power3.out" }, 0.1);
    tl.to(moon, { y: -20, autoAlpha: 0, duration: 0.5, ease: "power1.in" }, 2.2);
    for (const [left, top, delay, color] of STARS) {
      const star = svg("wink-star", "0 0 20 20", [STAR], [`fill: var(--wink-${color})`]);
      star.style.left = `${left}%`;
      star.style.top = `${top}%`;
      overlay.append(star);
      // Two slow twinkles each (well under 3 flashes a second).
      tl.fromTo(star, { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "sine.inOut", yoyo: true, repeat: 3 }, delay);
    }
  } else {
    const rise = -(window.innerHeight + 180);
    SPOTS.forEach(([left, delay], index) => {
      const flyer = flyerFor(kind, index, glyphs);
      flyer.style.left = `${left}%`;
      overlay.append(flyer);
      tl.to(flyer, { y: rise, duration: 2.3, ease: "power1.in" }, delay);
      tl.fromTo(flyer, { x: 0, rotation: -8 }, { x: 30, rotation: 10, duration: 0.55, ease: "sine.inOut", yoyo: true, repeat: 3 }, delay);
      if (kind !== "emoji") {
        tl.to(flyer, { scaleX: 0.35, duration: 0.14, ease: "sine.inOut", yoyo: true, repeat: 15 }, delay);
      }
    });
  }

  tl.to(overlay, { autoAlpha: 0, duration: 0.3 }, 2.7);
  return tl;
}

export default function initMsn(win) {
  const log = win.querySelector("[data-msn-log]");
  const buttons = win.querySelectorAll("[data-wink]");
  const skip = document.querySelector("[data-wink-skip]");
  if (!log || !buttons.length) return;

  const overlay = document.createElement("div");
  overlay.className = "wink-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.hidden = true;
  document.body.append(overlay);

  const motion = animateSection(overlay);
  let playing = null;
  let lastButton = null;

  const finish = () => {
    if (skip?.contains(document.activeElement)) lastButton?.focus();
    overlay.replaceChildren();
    overlay.hidden = true;
    if (skip) skip.hidden = true;
    playing = null;
  };

  skip?.addEventListener("click", () => playing?.progress(1));

  buttons.forEach((button) =>
    button.addEventListener("click", async () => {
      const label = (isNight() && button.dataset.nightLabel) || button.dataset.label;
      addLogLine(log, `${ui("winkSent", "You have sent a wink:")} ${label}`);
      playing?.progress(1); // one wink at a time
      lastButton = button;

      const kind = button.dataset.wink === "butterflies" && isNight() ? "moths" : button.dataset.wink;
      const glyphs = (button.dataset.glyphs || "✨").split(" ").filter(Boolean);
      const played = await motion.play((gsap, onRevert) => {
        overlay.hidden = false;
        if (skip) skip.hidden = false;
        onRevert(finish);
        return buildWink(gsap, overlay, kind, glyphs).eventCallback("onComplete", finish);
      });
      playing = played?.animation ?? null;
    })
  );
}
