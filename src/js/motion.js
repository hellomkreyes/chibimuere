/**
 * Motion on/off.
 *
 * Visitors can pause every animation with the footer "pause motion" toggle
 * (WCAG 2.2.2: anything that moves for more than 5 seconds needs a way to stop
 * it). Until they choose, the OS "reduce motion" setting decides.
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

function sync() {
  const on = motionEnabled();
  buttons.forEach((button) => button.setAttribute("aria-pressed", String(!on)));
  listeners.forEach((fn) => fn(on));
}

export function initMotion() {
  buttons = [...document.querySelectorAll(".motion-toggle")];
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
  buttons.forEach((button) => button.setAttribute("aria-pressed", String(!motionEnabled())));
}
