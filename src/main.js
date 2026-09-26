import { initMotion } from "./js/motion.js";
import { initTheme } from "./js/theme.js";
import { initNav } from "./js/nav.js";
import { initCursors } from "./js/cursors.js";
import { initEffects } from "./js/effects.js";
import { syncCurrentYear } from "./js/current-year.js";
import { initNudge } from "./js/nudge.js";
import { initTouch } from "./js/touch.js";

syncCurrentYear();
initMotion();
initTheme();
initNav();
initCursors();
initEffects();
initNudge();
initTouch();
