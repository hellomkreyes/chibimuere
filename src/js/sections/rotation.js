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
 *
 * Easter egg: every seat is also a button. Clicking one snatches the joint out
 * of turn, which "breaks the rotation": Auto-pass stops, the token jolts, the
 * bubble gets a scolding and a "rotation status: broken" chip appears until
 * someone passes properly again.
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
  const scold = bubble.querySelector("[data-rot-scold]");
  const brokenChip = article.querySelector("[data-rot-broken]");
  let strings = {};
  try {
    strings = JSON.parse(article.querySelector("[data-rot-strings]")?.textContent || "{}");
  } catch {
    strings = {};
  }
  const scolds = strings.scolds?.length ? strings.scolds : ["puff, puff, PASS. not puff, puff, grab."];

  let holder = 0;
  let breaks = 0;
  let restoredTimer = null;
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

  const show = ({ announce, scolding = "" }) => {
    const seat = seats[holder];
    const name = seat.querySelector(".rot-name").textContent;
    seats.forEach((s, i) => s.classList.toggle("is-holding", i === holder));
    holderName.textContent = name;
    question.textContent = seat.dataset.question;
    tag.textContent = seat.dataset.tag;
    if (scold) {
      scold.textContent = scolding;
      scold.hidden = !scolding;
    }
    place();
    if (announce) {
      status.textContent = scolding
        ? `${name} ${strings.snatched ?? "snatched it"}. ${scolding} ${seat.dataset.question}`
        : `${name} ${hasIt}: ${seat.dataset.question} ${seat.dataset.tag}`;
      animateBubble();
    }
  };

  const setChip = (text) => {
    clearTimeout(restoredTimer);
    if (!brokenChip) return;
    brokenChip.textContent = text;
    brokenChip.hidden = !text;
  };

  const pass = () => {
    holder = (holder + 1) % seats.length;
    show({ announce: true });
    if (article.hasAttribute("data-broken")) {
      article.removeAttribute("data-broken");
      setChip(strings.restored ?? "rotation restored");
      restoredTimer = setTimeout(() => setChip(""), 3500);
    }
  };

  // The easter egg: grabbing it out of turn.
  const jolt = () =>
    motion.play((gsap) =>
      gsap
        .timeline()
        .fromTo(token, { rotation: -28 }, { rotation: 0, duration: 0.9, ease: "elastic.out(1, 0.3)" })
        .fromTo(table, { x: -6 }, { x: 0, duration: 0.5, ease: "elastic.out(1.2, 0.25)" }, 0)
    );

  const snatch = (index) => {
    setAuto(false);
    breaks += 1;
    const already = index === holder;
    holder = index;
    article.setAttribute("data-broken", "");
    setChip(strings.broken ?? "rotation status: broken");
    show({ announce: true, scolding: already ? (strings.alreadyHas ?? scolds[0]) : scolds[(breaks - 1) % scolds.length] });
    jolt();
  };

  seats.forEach((seat, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "rot-grab";
    button.setAttribute("aria-label", `${strings.grab ?? "Snatch it for"} ${seat.querySelector(".rot-name").textContent}`);
    button.addEventListener("click", () => snatch(index));
    seat.append(button);
  });

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
