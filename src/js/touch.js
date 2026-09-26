/**
 * Touch stand-ins for the hover-only moments, plus the tap/click sparkle.
 *
 *  - Card spotlight: with no hover, the project card crossing the middle of
 *    the screen gets .is-lit, which shares the :hover styles (the day lift and
 *    the night red flip).
 *  - Tap sparkle: tapping or clicking a link or button drops a little sparkle
 *    (day) or a glitched pixel (night). Started as the touch stand-in for the
 *    hover cursors; clicks get it too. Skipped when motion is off.
 */
import { motionEnabled } from "./motion.js";

function initCardSpotlight() {
  const cards = document.querySelectorAll(".card");
  if (!cards.length || !window.matchMedia("(hover: none)").matches) return;

  // A thin band across the middle of the viewport: whichever card is in it is lit.
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => entry.target.classList.toggle("is-lit", entry.isIntersecting)),
    { rootMargin: "-45% 0px -45% 0px" }
  );
  cards.forEach((card) => observer.observe(card));
}

function initTapSparkle() {
  document.addEventListener(
    "pointerdown",
    (event) => {
      if (event.button !== 0 || !motionEnabled()) return; // primary tap / left click only
      if (!event.target.closest?.("a, button")) return;

      const spark = document.createElement("span");
      spark.className = "tap-spark";
      spark.setAttribute("aria-hidden", "true");
      spark.style.translate = `${event.clientX}px ${event.clientY}px`;
      document.body.append(spark);
      // animationend can be skipped (e.g. motion switched off mid-animation), so time out too.
      const remove = () => spark.remove();
      spark.addEventListener("animationend", remove, { once: true });
      setTimeout(remove, 800);
    },
    { passive: true }
  );
}

export function initTouch() {
  initCardSpotlight();
  initTapSparkle();
}
