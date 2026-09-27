/**
 * A little console.log hello for anyone poking around DevTools. Copy lives in
 * src/content.json under site.ui.consoleGreeting (see src/js/copy.js), with
 * this string as the fallback. Fails silently: it's a joke, not a feature.
 */
import { ui } from "./copy.js";

const FALLBACK =
  "🦋 oh hi, curious dev! you found the back door to my little cobweb.\nlook around, poke things, try not to break anything. xo, chibi muere";

let hasLogged = false;

export function initGreeting() {
  if (hasLogged) return;
  if (typeof console === "undefined" || typeof console.log !== "function") return;

  try {
    const text = ui("consoleGreeting", FALLBACK);
    const [headline, ...rest] = text.split("\n");
    const body = rest.join("\n");
    const headlineStyle =
      'font-family: "Space Mono", ui-monospace, monospace; font-size: 18px; font-weight: 700; line-height: 1.6';
    const bodyStyle =
      'font-family: "Space Mono", ui-monospace, monospace; font-size: 12px; font-weight: 400; line-height: 1.6';

    if (body) {
      console.log("%c%s\n%c%s", headlineStyle, headline, bodyStyle, body);
    } else {
      console.log("%c%s", headlineStyle, text);
    }

    hasLogged = true;
  } catch {
    // Never let a joke break the page.
  }
}
