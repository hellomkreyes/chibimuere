/**
 * Brands marquee: a keyboard-friendly strip when motion is paused.
 *
 * While motion plays, the logos drift past on their own (pure CSS). With motion
 * paused (the header ⏸ button, the footer toggle, or the OS "reduce motion"
 * setting) the CSS stops the drift and turns the window into a strip you
 * scroll sideways, so no brand is out of reach (see "Brands marquee" in
 * src/styles/main.css). A scrollable area also has to work without a mouse
 * (WCAG 2.1.1), so this gives it a tab stop and a name only while it can
 * actually scroll; while the marquee drifts it stays out of the tab order.
 *
 * Loaded with the main bundle rather than as a lazy section: the strip is
 * scrollable from first paint when motion is already off, so its tab stop
 * can't wait for the visitor to scroll near it.
 */
import { motionEnabled, onMotionChange } from "./motion.js";

export function initBrandsStrip() {
  const strip = document.querySelector(".brands-window");
  if (!strip) return;

  const label = strip.dataset.scrollLabel;

  const sync = (on) => {
    if (on) {
      strip.removeAttribute("tabindex");
      strip.removeAttribute("role");
      strip.removeAttribute("aria-label");
      return;
    }
    strip.tabIndex = 0;
    strip.setAttribute("role", "region");
    if (label) strip.setAttribute("aria-label", label);
  };

  sync(motionEnabled());
  onMotionChange(sync);
}
