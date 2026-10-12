/* Print CV: the button opens resume.html#print in a new tab, and that tab opens the
   browser's print dialog, where the visitor can print, save as PDF, or cancel.
   The print stylesheet in main.css decides what lands on paper. */

export function initPrintCv() {
  if (!document.querySelector("[data-print-cv]")) return;
  if (location.hash !== "#print") return;

  // Drop the hash so a reload or a shared link doesn't reopen the dialog.
  history.replaceState(null, "", location.pathname + location.search);

  const ready = document.readyState === "complete" ? Promise.resolve() : new Promise((r) => addEventListener("load", r, { once: true }));
  const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.all([ready, fonts]).then(() => {
    // One frame so layout settles before the print snapshot.
    requestAnimationFrame(() => window.print());
  });
}
