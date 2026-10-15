/*
 * Case studies: on phones the cards are a swipeable row and the stars below
 * jump to one card. The star that matches the card in view is marked
 * aria-current, whether the reader tapped a star, swiped or used the keyboard.
 * On wider screens the stars are hidden and the cards sit in a grid.
 */

export function initCases() {
  const root = document.querySelector("[data-cases]");
  if (!root) return;

  const track = root.querySelector("[data-cases-track]");
  const slides = [...root.querySelectorAll("[data-case-slide]")];
  const stars = [...root.querySelectorAll("[data-case-star]")];
  if (!track || !slides.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const mark = (index) => {
    stars.forEach((star, i) => star.setAttribute("aria-current", i === index ? "true" : "false"));
  };

  // The card whose left edge sits closest to the track's left edge is the one in view.
  const nearest = () => {
    const origin = track.getBoundingClientRect().left;
    let best = 0;
    let gap = Infinity;
    slides.forEach((slide, i) => {
      const distance = Math.abs(slide.getBoundingClientRect().left - origin);
      if (distance < gap) {
        gap = distance;
        best = i;
      }
    });
    return best;
  };

  stars.forEach((star, i) => {
    star.addEventListener("click", () => {
      slides[i]?.scrollIntoView({
        behavior: reduceMotion.matches ? "auto" : "smooth",
        inline: "start",
        block: "nearest",
      });
      mark(i);
    });
  });

  let frame = 0;
  track.addEventListener(
    "scroll",
    () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => mark(nearest()));
    },
    { passive: true },
  );

  mark(0);
}
