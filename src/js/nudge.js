/**
 * Messenger "nudge": shakes the bio window and logs it in the conversation,
 * like the classic desktop messengers did. With motion off, it only logs.
 */
import { motionEnabled } from "./motion.js";

const MAX_NUDGES = 5; // after this, chibimuere stops being polite about it

export function initNudge() {
  const win = document.querySelector("[data-msn]");
  const button = win?.querySelector("[data-msn-nudge]");
  const log = win?.querySelector("[data-msn-log]");
  if (!win || !button || !log) return;

  let count = 0;
  const addLine = (text) => {
    const li = document.createElement("li");
    li.className = "msn-line msn-system";
    li.textContent = text;
    log.append(li);
  };

  button.addEventListener("click", () => {
    if (count >= MAX_NUDGES) return; // muted
    count += 1;
    addLine("You have just sent a nudge!");
    if (count === MAX_NUDGES) {
      addLine("chibimuere has muted nudges. rude.");
      button.disabled = true;
    }

    if (motionEnabled()) {
      win.classList.remove("is-nudged");
      void win.offsetWidth; // restart the shake
      win.classList.add("is-nudged");
    }
  });
  win.addEventListener("animationend", (event) => {
    if (event.target === win) win.classList.remove("is-nudged");
  });
}
