/**
 * Dream Blunt Rotation: chibimuere hosts, the joint goes round the table, and
 * whoever holds it gets a question in the speech bubble.
 *
 * "Puff, puff, pass" hands it to the next seat; "Auto-pass" does that every
 * few seconds until paused (WCAG 2.2.2). The bubble follows the holder's row.
 * By day its text drifts in like settling smoke; by night the question types
 * out (GSAP SplitText). Both go through the motion controller, so with motion
 * off the text just appears. The visible bubble is aria-hidden; a polite
 * status line announces "X has it: question" once per pass.
 */
import { animateSection } from "../motion-controller.js";
import { motionEnabled } from "../motion.js";

const AUTO_MS = 3200;
const loadSplitText = () => import("gsap/SplitText");
const isNight = () => document.documentElement.dataset.theme === "night";

export default function initRotation(article) {
  const seats = [...article.querySelectorAll("[data-rot-seat]")];
  const body = article.querySelector(".rot-body");
  const table = article.querySelector(".rot-table");
  const token = article.querySelector("[data-rot-token]");
  const bubble = article.querySelector("[data-rot-bubble]");
  const status = article.querySelector("[data-rot-status]");
  const autoButton = article.querySelector("[data-rot-auto]");
  if (!seats.length || !table || !token || !bubble) return;

  const holderName = bubble.querySelector("[data-rot-holder]");
  const question = bubble.querySelector("[data-rot-question]");
  const tag = bubble.querySelector("[data-rot-tag]");
  const hasIt = body.dataset.hasIt ?? "has it";
  const motion = animateSection(article, { plugins: [loadSplitText] });

  let holder = 0;
  let timer = null;
  let playing = null;

  // Token on the holder's seat (top right corner); bubble level with their row.
  const place = () => {
    const seat = seats[holder];
    token.style.transform = `translate(${seat.offsetLeft + seat.offsetWidth - 46}px, ${seat.offsetTop + 2}px)`;
    const maxTop = Math.max(0, table.offsetHeight - bubble.offsetHeight);
    bubble.style.transform = `translateY(${Math.min(seat.offsetTop, maxTop)}px)`;
  };

  const animateBubble = async () => {
    playing?.progress(1);
    const SplitText = isNight() && motionEnabled() ? (await loadSplitText()).SplitText : null;
    const played = await motion.play((gsap, onRevert) => {
      if (SplitText) {
        const split = new SplitText(question, { type: "words,chars" }); // words keep each word on one line
        onRevert(() => split.revert());
        return gsap.from(split.chars, {
          autoAlpha: 0,
          duration: 0.01,
          stagger: Math.min(0.035, 1.6 / split.chars.length),
          onComplete: () => split.revert(),
        });
      }
      return gsap.fromTo(
        bubble.children,
        { autoAlpha: 0, filter: "blur(10px)", x: -20, y: 12 },
        { autoAlpha: 1, filter: "blur(0px)", x: 0, y: 0, duration: 1.1, stagger: 0.08, ease: "power2.out" }
      );
    });
    playing = played?.animation ?? null;
  };

  const show = ({ announce }) => {
    const seat = seats[holder];
    const name = seat.querySelector(".rot-name").textContent;
    seats.forEach((s, i) => s.classList.toggle("is-holding", i === holder));
    holderName.textContent = name;
    question.textContent = seat.dataset.question;
    tag.textContent = seat.dataset.tag;
    place();
    if (announce) {
      status.textContent = `${name} ${hasIt}: ${seat.dataset.question} ${seat.dataset.tag}`;
      animateBubble();
    }
  };

  const pass = () => {
    holder = (holder + 1) % seats.length;
    show({ announce: true });
  };

  const setAuto = (on) => {
    clearInterval(timer);
    timer = on ? setInterval(pass, AUTO_MS) : null;
    autoButton.setAttribute("aria-pressed", String(on));
    autoButton.textContent = on ? autoButton.dataset.pause : autoButton.dataset.play;
  };

  article.querySelector("[data-rot-pass]").addEventListener("click", pass);
  autoButton.addEventListener("click", () => setAuto(!timer));

  article.querySelector("[data-rot-controls]").hidden = false;
  token.hidden = false;
  bubble.hidden = false;
  show({ announce: false }); // first seat, silently: nothing is announced until someone passes
  new ResizeObserver(place).observe(table);
}
