/**
 * Resume stickers: slides each sticker's holographic foil and glitter as the page
 * scrolls, so the shine moves like a real holographic sticker tilting in the
 * light. It only sets one CSS variable per sticker (--shine, 0 to 100, from where
 * the sticker is in the viewport); the layers themselves are CSS (see "Resume
 * stickers" in src/styles/main.css). With motion off (Pause Motion or reduced
 * motion) the variable is cleared and the stickers sit still.
 */
import { motionEnabled, onMotionChange } from "../motion.js";

export default function initStickers() {
  const stickers = [...document.querySelectorAll("[data-sticker]")];
  if (!stickers.length) return;

  let queued = false;
  const update = () => {
    queued = false;
    const height = window.innerHeight;
    stickers.forEach((sticker, index) => {
      const rect = sticker.getBoundingClientRect();
      if (rect.bottom < -150 || rect.top > height + 150) return;
      // 0 as the sticker enters at the bottom, 100 as it leaves at the top, each offset a little.
      const progress = 1 - (rect.top + rect.height / 2) / height;
      const shine = Math.min(130, Math.max(-30, progress * 100 + index * 9));
      sticker.style.setProperty("--shine", shine.toFixed(1));
    });
  };
  const queue = () => {
    if (queued || !motionEnabled()) return;
    queued = true;
    requestAnimationFrame(update);
  };
  const reset = () => stickers.forEach((sticker) => sticker.style.removeProperty("--shine"));

  addEventListener("scroll", queue, { passive: true });
  addEventListener("resize", queue, { passive: true });
  onMotionChange((on) => (on ? queue() : reset()));
  if (motionEnabled()) update();
}
