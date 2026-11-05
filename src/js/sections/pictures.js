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
 *
 * The folder list on the left filters the grid (All pictures, the trips, the
 * Recycle Bin). Hidden items (the Recycle Bin and Thumbs.db) stay out of every
 * folder until "Show hidden items" is ticked. Without JS the list stays
 * hidden and every shown picture is a plain link.
 */
const SLIDE_MS = 3000;

export default function initPictures(win) {
  const body = win.querySelector(".pics-body");
  const folderNav = win.querySelector("[data-pics-folders]");
  const picks = [...win.querySelectorAll("[data-folder-pick]")];
  const toggle = win.querySelector("[data-pics-hidden-toggle]");
  const grid = win.querySelector("[data-pics-grid]");
  const viewer = win.querySelector("[data-pics-viewer]");
  const thumbs = [...win.querySelectorAll("[data-pic]")];
  if (!body || !grid || !viewer || !thumbs.length) return;

  const stage = viewer.querySelector(".pics-stage");
  const source = viewer.querySelector("[data-pics-picture] source");
  const img = viewer.querySelector("[data-pics-picture] img");
  const caption = viewer.querySelector("[data-pics-caption]");
  const play = viewer.querySelector("[data-pics-play]");
  const hint = win.querySelector("[data-pics-hint]");
  const hintMarkup = hint?.innerHTML;

  const count = win.querySelector("[data-pics-count]");
  const shown = (thumb) => !thumb.parentElement.hidden;

  let folder = "all";
  let showHidden = false;
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

  // Folder + "Show hidden items" decide which thumbnails are on the grid.
  const filter = () => {
    picks.forEach((pick) => {
      const id = pick.dataset.folderPick;
      if (pick.classList.contains("pics-folder-bin")) pick.hidden = !showHidden;
      pick.setAttribute("aria-pressed", String(id === folder));
    });
    thumbs.forEach((thumb) => {
      const inFolder = folder === "all" || thumb.dataset.folder === folder;
      thumb.parentElement.hidden = !(inFolder && (showHidden || !thumb.parentElement.hasAttribute("data-bin")));
    });
    if (selected >= 0 && !shown(thumbs[selected])) select(-1);
    if (count) {
      count.querySelector("[data-pics-count-num]").textContent = thumbs.filter((t) => shown(t) && !t.hasAttribute("data-cursed")).length;
      count.hidden = false;
    }
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
    const where = thumb.dataset.where;
    const rest = document.createElement("span");
    rest.textContent = where ? ` · ${where}` : "";
    const line = document.createElement("span");
    line.className = "pics-caption-line";
    line.textContent = thumb.querySelector(".pics-cap")?.textContent ?? "";
    caption.replaceChildren(strong, rest, line);
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

  // Previous and Next skip whatever the folder (or a hidden item) has filtered out.
  const step = (by) => {
    let next = current;
    do next = (next + by + thumbs.length) % thumbs.length;
    while (!shown(thumbs[next]) && next !== current);
    current = next;
    render();
  };

  const open = (index) => {
    current = index;
    select(index);
    render();
    body.hidden = true;
    viewer.hidden = false;
    viewer.focus();
  };

  const close = () => {
    stopSlideshow();
    viewer.hidden = true;
    body.hidden = false;
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

  picks.forEach((pick) =>
    pick.addEventListener("click", () => {
      folder = pick.dataset.folderPick;
      filter();
    }),
  );
  toggle?.addEventListener("change", () => {
    showHidden = toggle.checked;
    if (!showHidden && folder === "bin") folder = "all";
    filter();
  });
  if (folderNav) folderNav.hidden = false;
  filter();

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
