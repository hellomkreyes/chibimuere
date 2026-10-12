/**
 * Fold swap: the bitten cookie lives in the bottom-left corner while you're at
 * the top of the page. Start scrolling down and it slides out the bottom of the
 * viewport while the view-source button (</>) slides up into the same spot;
 * scroll back to the top and they swap again.
 *
 *   <html data-fold="top">    → cookie showing, </> tucked away
 *   <html data-fold="below">  → </> showing, cookie tucked away
 *
 * The CSS does the sliding (and skips it when motion is off). Whichever one is
 * tucked away is made inert, so it can't be tabbed to while it's off screen.
 * An open cookie policy keeps the cookie in place until it's closed.
 */
const root = document.documentElement;
const SWAP_AT = 0.25; // of the viewport height, scrolled from the top

export function initFoldSwap() {
  const fab = document.querySelector("[data-fold-swap]");
  if (!fab) return;
  const corner = document.querySelector(".cookie-corner");
  const policyOpen = () => corner?.querySelector("[data-cookie-policy]:not([hidden])");

  fab.hidden = false;
  let queued = false;

  const update = () => {
    queued = false;
    const below = window.scrollY > window.innerHeight * SWAP_AT && !policyOpen();
    const next = below ? "below" : "top";
    if (root.dataset.fold === next) return;
    root.dataset.fold = next;
    fab.inert = !below;
    if (corner) corner.inert = below;
  };
  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);
  // Closing the policy below the fold should tuck the cookie away again.
  corner?.addEventListener("click", queue);
  document.addEventListener("keydown", (event) => event.key === "Escape" && queue());
}
