/**
 * Day / night theme.
 *
 * The first paint is handled by the small inline script in each page's <head>
 * (so night visitors never see a flash of day); this module takes over after
 * that: the toggle, the transition effects, saving the choice, and following
 * the system setting until the visitor picks a side.
 */
const STORAGE_KEY = "chibi-theme";
// Earlier versions of the site saved "light" / "dark".
const LEGACY_THEMES = { light: "day", dark: "night" };
const THEME_COLORS = { day: "#f7f3ee", night: "#07060a" };

const root = document.documentElement;

function normalize(theme) {
  const value = LEGACY_THEMES[theme] ?? theme;
  return value === "day" || value === "night" ? value : null;
}

function readSavedTheme() {
  try {
    return normalize(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private mode / blocked storage: the toggle still works for this visit.
  }
}

export function currentTheme() {
  return root.dataset.theme === "night" ? "night" : "day";
}

function applyTheme(theme) {
  root.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = THEME_COLORS[theme];
}

export function initTheme({ reduceMotion = false } = {}) {
  const toggles = document.querySelectorAll(".theme-toggle");
  const flash = document.getElementById("flash");
  const body = document.body;
  let pending;
  let target = null; // the theme a mid-flight transition is heading to

  // Upgrade a legacy saved value in place.
  const saved = readSavedTheme();
  if (saved) saveTheme(saved);

  toggles.forEach((button) =>
    button.addEventListener("click", () => {
      // Flip from where we're heading, so fast double-clicks don't get lost.
      const next = (target ?? currentTheme()) === "night" ? "day" : "night";
      saveTheme(next);

      if (reduceMotion || !flash) {
        applyTheme(next);
        return;
      }

      // Restart the transition animation, then swap the theme mid-flash.
      body.classList.remove("to-day", "to-night");
      void body.offsetWidth;
      body.classList.add(`to-${next}`);
      clearTimeout(pending);
      target = next;
      pending = setTimeout(() => {
        applyTheme(next);
        target = null;
      }, next === "night" ? 120 : 250);
    })
  );

  if (flash) {
    flash.addEventListener("animationend", () => body.classList.remove("to-day", "to-night"));
  }

  // Follow the OS setting live, but only until the visitor has chosen.
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  systemDark.addEventListener?.("change", (event) => {
    if (!readSavedTheme()) applyTheme(event.matches ? "night" : "day");
  });
}
