import { test, expect } from "@playwright/test";

/* The resume page: sticker shimmer, a print layout that stays at two pages, and the Print CV button. */

test("sticker shimmer follows the scroll, and stops with Pause Motion", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("chibi-motion", "on");
    localStorage.setItem("chibi-cookie-peek", "dismissed");
  });
  await page.goto("/resume.html");
  await expect(page.locator("main")).toHaveAttribute("data-section-ready", "");

  // The stickers are decoration only.
  const stickers = page.locator("[data-sticker]");
  await expect(stickers).toHaveCount(6);
  for (const sticker of await stickers.all()) await expect(sticker).toHaveAttribute("aria-hidden", "true");

  const cursor = page.locator('[data-sticker="cursor"]');
  const shine = () => cursor.evaluate((el) => el.style.getPropertyValue("--shine"));
  await cursor.scrollIntoViewIfNeeded();
  await expect.poll(shine).not.toBe("");
  const before = await shine();
  await page.evaluate(() => window.scrollBy(0, 160));
  await expect.poll(shine).not.toBe(before);

  // Pause Motion clears the shine and keeps it still while scrolling.
  await page.locator(".motion-icon").click();
  await expect.poll(shine).toBe("");
  await page.evaluate(() => window.scrollBy(0, 160));
  await page.waitForTimeout(300);
  expect(await shine()).toBe("");
});

for (const theme of ["day", "night"]) {
  test(`the resume prints on two pages in ${theme}`, async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "PDF export is Chromium-only");
    await page.addInitScript((t) => {
      localStorage.setItem("chibi-theme", t);
      localStorage.setItem("chibi-motion", "off");
    }, theme);
    await page.goto("/resume.html");
    await page.emulateMedia({ media: "print" });
    const pdf = await page.pdf({ format: "Letter", printBackground: true });
    const pages = pdf.toString("latin1").match(/\/Type\s*\/Page(?![s\w])/g)?.length ?? 0;
    expect(pages).toBeGreaterThan(0);
    expect(pages, "printed pages").toBeLessThanOrEqual(2);
  });
}

test("Print CV opens the resume in a new tab, which opens the print dialog", async ({ page, context }) => {
  await page.goto("/resume.html");
  const link = page.locator("[data-print-cv]");
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAccessibleDescription(/\S/); // the hint that it opens a new tab

  // Count print calls in every page this context opens.
  await context.addInitScript(() => {
    window.__printed = 0;
    window.print = () => (window.__printed += 1);
  });
  const [tab] = await Promise.all([context.waitForEvent("page"), link.click()]);
  await tab.waitForLoadState("load");
  await expect.poll(() => tab.evaluate(() => window.__printed)).toBe(1);
  // The hash is dropped, so a reload doesn't reopen the dialog.
  await expect(tab).toHaveURL(/resume\.html$/);

  // The button itself stays off paper.
  await tab.emulateMedia({ media: "print" });
  await expect(tab.locator(".print-cv")).toBeHidden();
});
