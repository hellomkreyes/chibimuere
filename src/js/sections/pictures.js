/**
 * My Pictures: a folder of thumbnails that open in a viewer, like the old
 * desktop picture folders.
 *
 * Each thumbnail is a link to the full picture, so the folder works without
 * JS. With it: a click selects a picture (its caption stays up), and a
 * double-click, a second click or tap, or Enter opens it. Keyboard and
 * screen-reader activation (a click with no pointer) opens straight away.
 * The viewer has Back to all, Previous, Next, Rotate and a Slideshow toggle;
 * focus moves into it on open and back to the thumbnail on close (Escape
 * closes too). The item count leaves out Thumbs.db.
 */
const SLIDE_MS = 3000;

export default function initPictures(win) {
  const grid = win.querySelector("[data-pics-grid]");
  const viewer = win.querySelector("[data-pics-viewer]");
  const thumbs = [...win.querySelectorAll("[data-pic]")];
  if (!grid || !viewer || !thumbs.length) return;

  const stage = viewer.querySelector(".pics-stage");
  const source = viewer.querySelector("[data-pics-picture] source");
  const img = viewer.querySelector("[data-pics-picture] img");
  const caption = viewer.querySelector("[data-pics-caption]");
  const play = viewer.querySelector("[data-pics-play]");
  const hint = win.querySelector("[data-pics-hint]");
  const hintMarkup = hint?.innerHTML;

  const count = win.querySelector("[data-pics-count]");
  if (count) {
    count.querySelector("[data-pics-count-num]").textContent = thumbs.filter((t) => !t.hasAttribute("data-cursed")).length;
    count.hidden = false;
  }

  let selected = -1;
  let current = 0;
  let turns = 0;
  let timer = null;

  const select = (index) => {
    selected = index;
    thumbs.forEach((thumb, i) => {
      thumb.classList.toggle("is-selected", i === index);
      if (i === index) thumb.setAttribute("aria-current", "true");
      else thumb.removeAttribute("aria-current");
    });
  };

  // Rotated a quarter turn, the picture is scaled down to stay inside the stage.
  const applyTurns = () => {
    let scale = 1;
    if (turns % 2) {
      scale = Math.min(1, stage.clientWidth / img.offsetHeight, stage.clientHeight / img.offsetWidth);
    }
    img.style.transform = turns ? `rotate(${turns * 90}deg) scale(${scale})` : "";
  };

  const render = () => {
    const thumb = thumbs[current];
    const slug = thumb.dataset.pic;
    const file = thumb.querySelector(".pics-name")?.textContent ?? "";
    source.srcset = `/art/${slug}.avif 1x, /art/${slug}@2x.avif 2x`;
    img.src = `/art/${slug}.webp`;
    img.srcset = `/art/${slug}@2x.webp 2x`;
    img.width = Number(thumb.dataset.width);
    img.height = Number(thumb.dataset.height);
    img.alt = thumb.querySelector("img")?.alt ?? "";
    const strong = document.createElement("strong");
    strong.textContent = file;
    const rest = document.createElement("span");
    rest.textContent = ` · ${thumb.querySelector(".pics-cap")?.textContent ?? ""}`;
    caption.replaceChildren(strong, rest);
    viewer.setAttribute("aria-label", `${play.dataset.viewing ?? "Viewing"} ${file}`);
    if (hint) hint.textContent = file;
    turns = 0;
    applyTurns();
  };

  const stopSlideshow = () => {
    clearInterval(timer);
    timer = null;
    play.setAttribute("aria-pressed", "false");
    play.textContent = play.dataset.play ?? "Slideshow";
  };

  const step = (by) => {
    current = (current + by + thumbs.length) % thumbs.length;
    render();
  };

  const open = (index) => {
    current = index;
    select(index);
    render();
    grid.hidden = true;
    viewer.hidden = false;
    viewer.focus();
  };

  const close = () => {
    stopSlideshow();
    viewer.hidden = true;
    grid.hidden = false;
    if (hint) hint.innerHTML = hintMarkup;
    select(current);
    thumbs[current].focus();
  };

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener("click", (event) => {
      event.preventDefault();
      // detail is 0 for keyboard and assistive-tech activation: open right away.
      if (event.detail === 0 || selected === index) open(index);
      else select(index);
    });
    thumb.addEventListener("dblclick", (event) => {
      event.preventDefault();
      if (viewer.hidden) open(index);
    });
  });

  viewer.querySelector("[data-pics-back]").addEventListener("click", close);
  viewer.querySelector("[data-pics-prev]").addEventListener("click", () => step(-1));
  viewer.querySelector("[data-pics-next]").addEventListener("click", () => step(1));
  viewer.querySelector("[data-pics-rotate]").addEventListener("click", () => {
    turns = (turns + 1) % 4;
    applyTurns();
  });
  play.addEventListener("click", () => {
    if (timer) return stopSlideshow();
    timer = setInterval(() => step(1), SLIDE_MS);
    play.setAttribute("aria-pressed", "true");
    play.textContent = play.dataset.pause ?? "Pause slideshow";
  });
  img.addEventListener("load", applyTurns);
  viewer.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}
