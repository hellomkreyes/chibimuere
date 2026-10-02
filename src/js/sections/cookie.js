/**
 * Cookie corner: the bitten cookie, its one-time peek and the short policy.
 *
 * The peek shows once, on a first visit; "Accept all 0", "Also accept", × or
 * Escape dismiss it, and the dismissal is saved in localStorage (not a
 * cookie, so the joke stays true). The cookie opens the policy, a non-modal
 * dialog: focus moves into it, and × / Escape / the cookie close it and put
 * focus back on the cookie. Nothing here blocks the page.
 */
const STORAGE_KEY = "chibi-cookie-peek";
const PEEK_DELAY = 1200; // after load, so the status message is announced on its own

function peekDismissed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "dismissed";
  } catch {
    return false;
  }
}

export default function initCookie(corner) {
  const jar = corner.querySelector("[data-cookie-jar]");
  const peek = corner.querySelector("[data-cookie-peek]");
  const policy = corner.querySelector("[data-cookie-policy]");
  if (!jar || !peek || !policy) return;

  const dismissPeek = () => {
    if (peek.hidden) return;
    const hadFocus = peek.contains(document.activeElement);
    peek.hidden = true;
    try {
      localStorage.setItem(STORAGE_KEY, "dismissed");
    } catch {
      // Storage blocked: it just peeks again next visit.
    }
    if (hadFocus) jar.focus();
  };

  const setPolicy = (open) => {
    policy.hidden = !open;
    jar.setAttribute("aria-expanded", String(open));
    if (open) {
      dismissPeek();
      policy.focus();
    } else if (policy.contains(document.activeElement) || document.activeElement === document.body) {
      jar.focus();
    }
  };

  jar.hidden = false;
  jar.addEventListener("click", () => setPolicy(policy.hidden));
  corner.querySelectorAll("[data-cookie-dismiss]").forEach((button) => button.addEventListener("click", dismissPeek));
  corner.querySelector("[data-cookie-close]")?.addEventListener("click", () => setPolicy(false));

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!policy.hidden) setPolicy(false);
    else dismissPeek();
  });

  if (!peekDismissed()) setTimeout(() => (peek.hidden = false), PEEK_DELAY);
}
