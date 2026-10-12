/**
 * Scroll transitions between sections.
 *
 * Each big section gets three hairline "seams" running down behind its content
 * (pastel by day, red / cyan by night), and its heading's letters rise and
 * settle as it scrolls into view. Both are scrubbed to the scroll position
 * (GSAP ScrollTrigger), so scrolling back up rewinds them.
 *
 * The seams are plain markup added once, and the CSS draws them finished, so
 * with motion off (Pause Motion or reduced motion) the page just shows the
 * lines and whole headings. With motion on, each section registers with the
 * motion controller when it comes near the viewport, which loads GSAP,
 * ScrollTrigger and SplitText only then. Reverting the context kills the
 * triggers and un-splits the headings.
 */
import { animateSection } from "./motion-controller.js";

const SECTIONS = ".brands-section, .portfolio-section, .artsy-section, .fartsy-section, .contact-band, .resume-section";
const HEADING = ":scope > .shell h2";

// The motion controller registers whatever these resolve to (module.default); keep the classes too.
let ScrollTrigger = null;
let SplitText = null;
const loadScrollTrigger = () =>
  import("gsap/ScrollTrigger").then((module) => {
    ScrollTrigger = module.ScrollTrigger ?? module.default;
    return module;
  });
const loadSplitText = () =>
  import("gsap/SplitText").then((module) => {
    SplitText = module.SplitText ?? module.default;
    return module;
  });

function addSeams(section) {
  if (section.querySelector(":scope > .seams")) return;
  const seams = document.createElement("div");
  seams.className = "seams";
  seams.setAttribute("aria-hidden", "true");
  seams.innerHTML = "<span></span><span></span><span></span>";
  section.prepend(seams);
  section.classList.add("has-seams");
}

function register(section) {
  const heading = section.querySelector(HEADING);
  animateSection(section, {
    plugins: [loadScrollTrigger, loadSplitText],
    animate(gsap) {
      const lines = section.querySelectorAll(":scope > .seams span");

      gsap.from(lines, {
        scaleY: 0,
        ease: "none",
        stagger: 0.18,
        scrollTrigger: { trigger: section, start: "top bottom", end: "top 25%", scrub: 0.6 },
      });

      if (!heading || !SplitText) return undefined;
      // aria: "auto" keeps the heading's text as one accessible name while the letters are split.
      const split = new SplitText(heading, { type: "words,chars", charsClass: "st-char", aria: "auto" });
      gsap.from(split.chars, {
        yPercent: 70,
        rotation: (i) => (i % 2 ? 7 : -7),
        opacity: 0.2,
        ease: "none",
        stagger: 0.05,
        scrollTrigger: { trigger: heading, start: "top 95%", end: "top 60%", scrub: 0.4 },
      });
      // Sections above load later and push this one down: re-measure once things settle.
      requestAnimationFrame(() => ScrollTrigger?.refresh());
      return () => split.revert();
    },
  });
}

export function initScrollTransitions() {
  const sections = [...document.querySelectorAll(SECTIONS)];
  if (!sections.length) return;
  sections.forEach(addSeams);

  if (!("IntersectionObserver" in window)) {
    sections.forEach(register);
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        register(entry.target);
      }
    },
    { rootMargin: "100% 0px" }
  );
  sections.forEach((section) => observer.observe(section));
}
