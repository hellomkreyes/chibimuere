/**
 * Webring: one featured entry at a time, with ‹ prev | random | next › ring
 * nav and a position counter, filter chips for the kinds that have entries,
 * and the 88x31 button wall (each button features its entry).
 *
 * Kinds are free text ("Fanfic", "Zine", "Playlist"…). Each kind gets one of
 * six colour tones from a hash of its name, so new kinds need no code. Its call
 * to action comes from the entry's own "cta", else the kind's preset in
 * content.json (artsy.ring.kinds), else the catch-all. A "new" sparkle shows
 * for 30 days after "added", worked out here so it expires without a
 * redeploy. "Boost it" opens the share sheet where there is one, and
 * otherwise copies the link. Without JS, all entries are simply listed.
 */
const NEW_FOR_DAYS = 30;
const DAY_MS = 86_400_000;
const TONES = 6;

// Same kind, same tone, on every page load.
function toneFor(kind) {
  let hash = 0;
  for (const char of kind.toLowerCase()) hash = (hash * 31 + char.codePointAt(0)) >>> 0;
  return String((hash % TONES) + 1);
}

export default function initWebring(ring) {
  const entries = [...ring.querySelectorAll("[data-ring-entry]")];
  const picks = [...ring.querySelectorAll("[data-ring-pick]")];
  if (!entries.length) return;

  let strings = {};
  try {
    strings = JSON.parse(ring.querySelector("[data-ring-strings]")?.textContent || "{}");
  } catch {
    // Fall back to the labels below.
  }
  const kinds = strings.kinds ?? {};
  const status = ring.querySelector("[data-ring-status]");
  const position = ring.querySelector("[data-ring-pos]");
  const chips = ring.querySelector("[data-ring-chips]");
  const dateFormat = new Intl.DateTimeFormat(document.documentElement.lang || "en", { dateStyle: "medium", timeZone: "UTC" });

  // Tones, calls to action, "new" and readable dates.
  entries.forEach((entry, i) => {
    const kind = entry.dataset.kind;
    const tone = toneFor(kind);
    entry.querySelector(".ring-thumb").dataset.tone = tone;
    if (picks[i]) picks[i].dataset.tone = tone;
    if (!entry.dataset.cta && kinds[kind]?.cta) entry.querySelector("[data-ring-cta]").textContent = kinds[kind].cta;
    const added = Date.parse(entry.dataset.added);
    if (Date.now() - added < NEW_FOR_DAYS * DAY_MS) entry.querySelector("[data-ring-new]").hidden = false;
    const time = entry.querySelector("time");
    if (time && !Number.isNaN(added)) time.textContent = dateFormat.format(added);
  });
  let filter = "all";
  let current = entries[0];
  const pool = () => entries.filter((e) => filter === "all" || e.dataset.kind === filter);

  const show = (entry, { announce = true } = {}) => {
    current = entry;
    const list = pool();
    entries.forEach((e) => (e.hidden = e !== entry));
    picks.forEach((pick, i) => {
      pick.parentElement.hidden = !list.includes(entries[i]);
      if (entries[i] === entry) pick.setAttribute("aria-current", "true");
      else pick.removeAttribute("aria-current");
    });
    const text = `${list.indexOf(entry) + 1} ${position.dataset.of ?? "of"} ${list.length}`;
    position.textContent = text;
    if (announce) status.textContent = `${text}: ${entry.dataset.name}`;
  };

  const step = (by) => {
    const list = pool();
    show(list[(list.indexOf(current) + by + list.length) % list.length]);
  };

  // Filter chips: "All" plus one per kind that has entries, in order of appearance.
  const present = [...new Set(entries.map((e) => e.dataset.kind))];
  if (present.length > 1) {
    const makeChip = (value, label) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "ring-chip";
      chip.textContent = label;
      chip.setAttribute("aria-pressed", String(value === filter));
      chip.addEventListener("click", () => {
        filter = value;
        chips.querySelectorAll(".ring-chip").forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
        show(pool()[0]);
      });
      return chip;
    };
    chips.append(makeChip("all", strings.all ?? "All"), ...present.map((kind) => makeChip(kind, kinds[kind]?.plural ?? kind)));
    chips.hidden = false;
  }

  ring.querySelector("[data-ring-prev]").addEventListener("click", () => step(-1));
  ring.querySelector("[data-ring-next]").addEventListener("click", () => step(1));
  ring.querySelector("[data-ring-random]").addEventListener("click", () => {
    const others = pool().filter((e) => e !== current);
    if (others.length) show(others[Math.floor(Math.random() * others.length)]);
  });
  picks.forEach((pick, i) => pick.addEventListener("click", () => show(entries[i])));

  // Boost it: share sheet if there is one, else copy the link.
  entries.forEach((entry) => {
    const boost = entry.querySelector("[data-ring-boost]");
    const url = new URL(entry.dataset.url, location.href).href;
    boost.hidden = false;
    boost.addEventListener("click", async () => {
      if (navigator.share) {
        try {
          await navigator.share({ title: entry.dataset.name, url });
        } catch {
          // Closed the share sheet: nothing to do.
        }
        return;
      }
      try {
        await navigator.clipboard.writeText(url);
        boost.textContent = strings.copied ?? "Link copied!";
        status.textContent = boost.textContent;
        setTimeout(() => (boost.textContent = strings.boost ?? "Boost it"), 1600);
      } catch {
        // No clipboard access: the link itself is right there.
      }
    });
  });

  ring.querySelector("[data-ring-nav]").hidden = false;
  ring.querySelector("[data-ring-wall]").hidden = false;
  ring.classList.add("is-ready");
  show(entries[0], { announce: false });
}
