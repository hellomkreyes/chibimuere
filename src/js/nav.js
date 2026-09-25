/**
 * Header behaviour: the small-screen menu, and a "scrolled" state that frosts
 * the day header once the hero has moved out of the way.
 */
export function initNav() {
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const links = document.querySelectorAll(".site-nav a");
  if (!header) return;

  if (menuToggle) {
    const setMenuOpen = (isOpen) => {
      header.classList.toggle("menu-open", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    };

    menuToggle.addEventListener("click", () => setMenuOpen(!header.classList.contains("menu-open")));
    links.forEach((link) => link.addEventListener("click", () => setMenuOpen(false)));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && header.classList.contains("menu-open")) {
        setMenuOpen(false);
        menuToggle.focus();
      }
    });
    document.addEventListener("click", (event) => {
      if (header.classList.contains("menu-open") && !header.contains(event.target)) setMenuOpen(false);
    });
  }

  // A 1px sentinel at the top of the page; no scroll listener needed.
  const sentinel = document.createElement("div");
  sentinel.setAttribute("aria-hidden", "true");
  sentinel.style.cssText = "position:absolute;top:0;left:0;width:1px;height:80px;pointer-events:none";
  document.body.prepend(sentinel);
  new IntersectionObserver(([entry]) => header.classList.toggle("is-scrolled", !entry.isIntersecting)).observe(
    sentinel
  );
}
