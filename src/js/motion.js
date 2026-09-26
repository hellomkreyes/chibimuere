/**
 * Motion on/off.
 *
 * Visitors can pause every animation with a [data-motion-toggle] button: the
 * ⏸ / ▶ icon in the header, or "pause motion" in the footer (WCAG 2.2.2:
 * anything that moves for more than 5 seconds needs a way to stop it). They
 * stay in sync. Until visitors choose, the OS "reduce motion" setting decides.
 *
 *   <html data-motion="off">  → paused (visitor's choice, saved)
 *   <html data-motion="on">   → playing (visitor's choice, saved)
 *   no data-motion            → follow prefers-reduced-motion
 *
 * The saved choice is applied before first paint by the inline <head> script.
 */
const STORAGE_KEY = "chibi-motion";
const root = document.documentElement;
const systemReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
const listeners = new Set();
let buttons = [];

export function motionEnabled() {
  if (root.dataset.motion === "on") return true;
  if (root.dataset.motion === "off") return false;
  return !systemReduce.matches;
}

/** Call `fn(isOn)` whenever motion is switched on or off. */
export function onMotionChange(fn) {
  listeners.add(fn);
}

// aria-pressed carries the state; the icon button's tooltip follows what a click will do.
function syncButtons(on) {
  buttons.forEach((button) => {
    button.setAttribute("aria-pressed", String(!on));
    if (button.hasAttribute("title")) button.title = on ? "Pause motion" : "Play motion";
  });
}

function sync() {
  const on = motionEnabled();
  syncButtons(on);
  listeners.forEach((fn) => fn(on));
}

export function initMotion() {
  buttons = [...document.querySelectorAll("[data-motion-toggle]")];
  buttons.forEach((button) =>
    button.addEventListener("click", () => {
      const next = motionEnabled() ? "off" : "on";
      root.dataset.motion = next;
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Storage blocked: the setting still applies for this visit.
      }
      sync();
    })
  );
  systemReduce.addEventListener?.("change", () => {
    if (!root.dataset.motion) sync();
  });
  syncButtons(motionEnabled());
}
