/**
 * Keeps "this year" references current without touching dates that only look
 * like this year (project dates, resume ranges, the © 3005 joke).
 *
 * It's opt-in so context decides, not a find-and-replace:
 *
 *   <time data-current-year>2026</time>
 *     → becomes the visitor's current year (and its datetime attribute too).
 *
 *   <span data-years-since="1997">29</span>
 *     → becomes the number of years since 1997.
 *
 * The number in the HTML is the fallback shown without JavaScript, and it's the
 * same width as the replacement, so nothing shifts when it updates.
 */
export function syncCurrentYear(root = document, now = new Date()) {
  const year = now.getFullYear();

  root.querySelectorAll("[data-current-year]").forEach((el) => {
    el.textContent = String(year);
    if (el.hasAttribute("datetime")) el.setAttribute("datetime", String(year));
  });

  root.querySelectorAll("[data-years-since]").forEach((el) => {
    const since = Number.parseInt(el.dataset.yearsSince, 10);
    if (Number.isFinite(since) && since <= year) el.textContent = String(year - since);
  });
}
