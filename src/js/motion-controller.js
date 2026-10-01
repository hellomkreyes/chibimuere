/**
 * Motion controller: the one place GSAP animations are switched on and off.
 *
 * Sections never decide for themselves whether to animate. They register here,
 * and on every motion change (the ⏸ in the header, "pause motion" in the
 * footer, or the OS reduce-motion setting; see motion.js) the controller
 * reverts every section's GSAP context, then rebuilds its animations or
 * renders its still state.
 *
 * GSAP (and any plugins a section asks for) is imported the first time a
 * registered section is allowed to move, so it never weighs on the first visit
 * and never loads at all while motion is off.
 *
 *   const motion = animateSection(element, {
 *     plugins: [() => import("gsap/DrawSVGPlugin")],   // optional
 *     animate(gsap) { gsap.from(".node", { scale: 0, stagger: 0.05 }); },
 *     still() { … },  // optional: anything the static state needs beyond CSS
 *   });
 *
 *   // One-off motion, such as a wink. Resolves to { animation } (whatever fn
 *   // returns, wrapped because GSAP animations are thenables), or null when
 *   // motion is off. It lives in the section's context, so pausing motion
 *   // mid-wink reverts it too.
 *   const played = await motion.play((gsap) => gsap.timeline().to(…));
 *   skipButton.onclick = () => played?.animation.progress(1);
 *
 *   motion.destroy();  // revert and stop listening
 *
 * Selector text inside animate() and play() is scoped to the section element.
 * Reverting puts every animated property back as it was, so the section's
 * markup and CSS should already show the finished, readable state.
 */
import { motionEnabled, onMotionChange } from "./motion.js";

const sections = new Set();
const plugins = new Map();
let gsapReady = null;

async function loadGsap(loaders = []) {
  gsapReady ??= import("gsap").then((module) => module.gsap);
  const gsap = await gsapReady;
  for (const load of loaders) {
    if (!plugins.has(load)) plugins.set(load, load().then((module) => gsap.registerPlugin(module.default)));
    await plugins.get(load);
  }
  return gsap;
}

// The section's GSAP context, created on first use; play() may get there before apply() does.
function contextFor(section, gsap) {
  section.ctx ??= gsap.context(() => {}, section.scope);
  return section.ctx;
}

async function apply(section) {
  const run = ++section.run;
  section.ctx?.revert();
  section.ctx = null;
  if (!motionEnabled()) {
    section.still?.();
    return;
  }
  const gsap = await loadGsap(section.plugins);
  // Motion was switched again (or the section destroyed) while GSAP loaded.
  if (run !== section.run || !sections.has(section)) return;
  if (section.animate) contextFor(section, gsap).add(() => section.animate(gsap));
}

onMotionChange(() => sections.forEach(apply));

export function animateSection(scope, { animate, still, plugins: sectionPlugins = [] } = {}) {
  const section = { scope, animate, still, plugins: sectionPlugins, ctx: null, run: 0 };
  sections.add(section);
  apply(section);

  return {
    async play(fn) {
      if (!motionEnabled() || !sections.has(section)) return null;
      const run = section.run;
      const gsap = await loadGsap(section.plugins);
      if (run !== section.run || !motionEnabled() || !sections.has(section)) return null;
      let animation = null;
      contextFor(section, gsap).add(() => {
        animation = fn(gsap);
      });
      return { animation };
    },
    destroy() {
      sections.delete(section);
      section.run++;
      section.ctx?.revert();
      section.ctx = null;
    },
  };
}
