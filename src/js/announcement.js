/*
 * Announcement bar. The pre-paint script in <head> adds .has-announcement to
 * <html> unless the visitor dismissed it this session, so nothing flashes.
 * Here we keep --announce-h (the space the header and page make for the bar)
 * in step with its real height, since the text can wrap on narrow screens or
 * large type, and handle the dismiss button.
 */
const KEY = "chibi-announcement";

export function initAnnouncement() {
  const bar = document.querySelector("[data-announcement]");
  const close = bar?.querySelector("[data-announcement-close]");
  if (!bar || !close) return;

  const root = document.documentElement;

  const measure = () => {
    if (!root.classList.contains("has-announcement")) return;
    root.style.setProperty("--announce-h", `${bar.offsetHeight}px`);
  };

  const observer = new ResizeObserver(measure);
  observer.observe(bar);
  measure();

  close.addEventListener("click", () => {
    observer.disconnect();
    root.classList.remove("has-announcement");
    root.style.removeProperty("--announce-h");
    try {
      sessionStorage.setItem(KEY, "dismissed");
    } catch {
      /* storage blocked: the bar just comes back on the next page */
    }
    // The button is gone, so hand focus to the page rather than dropping it.
    const target = document.getElementById("main-content");
    if (target) {
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }
  });
}
