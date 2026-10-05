import { test, expect } from "@playwright/test";

/* The resume page: real details, and a print layout that stays at two pages. */

test("the resume has real contact details and history, with no placeholders", async ({ page }) => {
  await page.goto("/resume.html");
  const text = await page.locator("main").innerText();
  expect(text).not.toContain(".example");
  expect(text).not.toMatch(/placeholder/i);
  await expect(page.getByRole("link", { name: /say hello/i })).toHaveAttribute("href", "mailto:mkmuere.codes@gmail.com");
  await expect(page.getByRole("heading", { name: "Technical Lead, Domaine" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Development Manager, Endy" })).toBeVisible();
  // The resume's phone number stays off the public page.
  expect(await page.content()).not.toMatch(/416\)? ?881/);
});

test("sticker shimmer follows the scroll, and stops with Pause Motion", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("chibi-motion", "on");
    localStorage.setItem("chibi-cookie-peek", "dismissed");
  });
  await page.goto("/resume.html");
  await expect(page.locator("main")).toHaveAttribute("data-section-ready", "");

  // Seven decorative stickers stand in for the old section numbers.
  const stickers = page.locator("[data-sticker]");
  await expect(stickers).toHaveCount(7);
  for (const sticker of await stickers.all()) await expect(sticker).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator(".section-number")).toHaveCount(0);

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
