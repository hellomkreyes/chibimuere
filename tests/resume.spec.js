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
