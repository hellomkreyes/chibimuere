/**
 * Strings the scripts put on the page (aria-labels, tooltips, nudge messages).
 * They live in src/content.json under site.ui and are baked into each page as
 * <script type="application/json" id="ui-copy"> by the content plugin.
 */
let strings = null;

export function ui(key, fallback) {
  if (!strings) {
    try {
      strings = JSON.parse(document.getElementById("ui-copy")?.textContent || "{}");
    } catch {
      strings = {};
    }
  }
  return strings[key] ?? fallback;
}
