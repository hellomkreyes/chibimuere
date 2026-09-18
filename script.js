const themeToggle = document.querySelector(".theme-toggle");
const siteHeader = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navigationLinks = document.querySelectorAll(".site-nav a");
const savedTheme = localStorage.getItem("chibi-theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

function setTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute("aria-pressed", isDark);
  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Switch to day mode" : "Switch to night mode"
  );
}

setTheme(savedTheme || (prefersDark ? "dark" : "light"));
themeToggle.addEventListener("click", () => {
  const nextTheme =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem("chibi-theme", nextTheme);
  setTheme(nextTheme);
});

function setMenuOpen(isOpen) {
  siteHeader.classList.toggle("menu-open", isOpen);
  menuToggle.setAttribute("aria-expanded", isOpen);
  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Close navigation menu" : "Open navigation menu"
  );
}

menuToggle.addEventListener("click", () => {
  setMenuOpen(!siteHeader.classList.contains("menu-open"));
});
navigationLinks.forEach((link) =>
  link.addEventListener("click", () => setMenuOpen(false))
);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenuOpen(false);
});
