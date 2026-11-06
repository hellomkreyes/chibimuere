/*
 * Announcement bar. The pre-paint script in <head> adds .has-announcement to
 * <html> unless the visitor dismissed it this session, so nothing flashes.
 * Here we keep --announce-h (the space the header and page make for the bar)
 * in step with its real height, since the text can wrap on narrow screens or
 * large type, and handle the dismiss button.
 *
 * It also turns the one message into a looping marquee: the real item stays
 * as the only thing screen readers get, and aria-hidden copies fill the rest
 * of the track (twice over, so the loop has no seam). With motion paused the
 * CSS hides every copy and the message sits still, centred.
 */
const KEY = "chibi-announcement";
const SPEED = 55; // px per second: slow enough to read, fast enough to feel urgent
const MAX_COPIES = 24;

function buildMarquee(bar) {
  const track = bar.querySelector("[data-announcement-track]");
  const item = track?.querySelector("[data-announcement-item]");
  if (!track || !item) return () => {};

  const half = document.createElement("div");
  half.className = "announcement-half";
  item.replaceWith(half);
  half.append(item);

  const mirror = document.createElement("div");
  mirror.className = "announcement-half";
  mirror.setAttribute("aria-hidden", "true");
  track.append(mirror);

  const copy = () => {
    const c = item.cloneNode(true);
    c.removeAttribute("data-announcement-item");
    c.setAttribute("aria-hidden", "true");
    return c;
  };

  const fill = () => {
    // Each half has to be at least as wide as the bar, or the loop shows a gap.
    while (half.children.length > 1) half.lastChild.remove();
    while (
      half.scrollWidth < bar.clientWidth &&
      half.children.length < MAX_COPIES
    )
      half.append(copy());
    mirror.replaceChildren(
      ...[...half.children].map((el) => el.cloneNode(true)),
    );
    mirror
      .querySelectorAll("[data-announcement-item]")
      .forEach((el) => el.removeAttribute("data-announcement-item"));
    track.style.setProperty(
      "--announce-dur",
      `${Math.round(half.scrollWidth / SPEED)}s`,
    );
    track.classList.add("is-marquee");
  };

  fill();
  return fill;
}

export function initAnnouncement() {
  const bar = document.querySelector("[data-announcement]");
  const close = bar?.querySelector("[data-announcement-close]");
  if (!bar || !close) return;

  const root = document.documentElement;

  const refill = buildMarquee(bar);
  let lastWidth = bar.clientWidth;

  const measure = () => {
    if (!root.classList.contains("has-announcement")) return;
    root.style.setProperty("--announce-h", `${bar.offsetHeight}px`);
    if (bar.clientWidth !== lastWidth) {
      lastWidth = bar.clientWidth;
      refill();
    }
  };

  // Web fonts change the text width, and with it how many copies fill a half.
  document.fonts?.ready.then(() => {
    if (root.classList.contains("has-announcement")) refill();
  });

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
      if (!target.hasAttribute("tabindex"))
        target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }
  });
}
