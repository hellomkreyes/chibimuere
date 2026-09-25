import { initTheme } from "./js/theme.js";
import { initNav } from "./js/nav.js";
import { initCursors } from "./js/cursors.js";
import { initEffects } from "./js/effects.js";
import { syncCurrentYear } from "./js/current-year.js";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

syncCurrentYear();
initTheme({ reduceMotion });
initNav();
initCursors();
initEffects({ reduceMotion });
