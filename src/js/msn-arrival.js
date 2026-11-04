/**
 * Messenger arrival: when the bio window scrolls into view, its latest message
 * slides in as if chibi.muere just sent it over to the viewer.
 *
 * The message is real, readable markup from the start (no JS, reduced motion
 * and paused motion all show it as normal). Only when motion is on does the
 * controller hide it, wait for the window to come into view, then play it in.
 * It only changes opacity and transform, so the line keeps its space (no layout
 * shift) and stays in the accessibility tree the whole time.
 */
import { animateSection } from "./motion-controller.js";

const DELAY = 0.7; // seconds: lets the "is typing a message…" status read first

export function initMsnArrival(win, log) {
  const lines = log.querySelectorAll(".msn-line:not(.msn-system)");
  const latest = lines[lines.length - 1];
  if (!latest) return;

  let arrived = false; // play once; toggling motion later must not replay it

  animateSection(win, {
    animate(gsap) {
      if (arrived) return undefined;

      const arrive = () => {
        arrived = true;
        gsap.to(latest, { opacity: 1, y: 0, scale: 1, duration: 0.7, delay: DELAY, ease: "back.out(1.4)", clearProps: "transform" });
      };

      gsap.set(latest, { opacity: 0, y: 28, scale: 0.97, transformOrigin: "0% 100%" });

      if (!("IntersectionObserver" in window)) {
        arrive();
        return undefined;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer.disconnect();
          arrive();
        },
        { threshold: 0.5, rootMargin: "0px 0px -15% 0px" }
      );
      observer.observe(latest);
      return () => observer.disconnect(); // runs when motion is switched off or rebuilt
    },
  });
}
