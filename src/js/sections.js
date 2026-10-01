/**
 * Section loader: each section's code loads only when the section comes near
 * the viewport, so none of it weighs on the first visit.
 *
 *   <section data-section="pictures">…</section>
 *     → imports src/js/sections/pictures.js when the section is about a
 *       screen away, then calls its default export once with the element.
 *
 * The built HTML already holds the section's full content (see data-copy-if in
 * scripts/content-plugin.js); the module adds behavior and motion on top. If
 * the import fails, the static section stays as it is. Once the module has
 * run, the element gets data-section-ready, which tests can wait for.
 */
const modules = import.meta.glob("./sections/*.js");

async function load(element) {
  const name = element.dataset.section;
  const importModule = modules[`./sections/${name}.js`];
  if (!importModule) {
    console.warn(`[sections] No module for data-section="${name}"`);
    return;
  }
  try {
    const module = await importModule();
    await module.default(element);
    element.dataset.sectionReady = "";
  } catch (error) {
    console.error(`[sections] "${name}" failed to start`, error);
  }
}

export function initSections() {
  const elements = document.querySelectorAll("[data-section]");
  if (!elements.length) return;
  if (!("IntersectionObserver" in window)) {
    elements.forEach(load);
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        load(entry.target);
      }
    },
    { rootMargin: "100% 0px" }
  );
  elements.forEach((element) => observer.observe(element));
}
