import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/* View source: the </> button and the backtick key outline the page with its own tags. */

for (const theme of ["day", "night"]) {
  test(`view source labels the page in ${theme}; no axe violations`, async ({ page }) => {
    await page.addInitScript((t) => {
      localStorage.setItem("chibi-theme", t);
      localStorage.setItem("chibi-cookie-peek", "dismissed");
    }, theme);
    await page.goto("/");
    const button = page.getByRole("button", { name: "View source" });
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator(".vs-label")).toHaveCount(0);

    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("html")).toHaveAttribute("data-view-source", "on");
    await expect(page.getByRole("status").filter({ hasText: "View source on" })).toHaveCount(1);

    const labels = page.locator(".vs-layer .vs-label, .vs-layer-fixed .vs-label");
    await expect(labels.filter({ hasText: '<main id="main-content">' })).toHaveCount(1);
    await expect(labels.filter({ hasText: '<section id="bio">' })).toHaveCount(1);
    await expect(labels.filter({ hasText: "</section>" }).first()).toBeAttached();
    await expect(labels.filter({ hasText: '<nav id="primary-navigation">' })).toHaveCount(1);
    await expect(page.locator("[data-vs-tagged]").first()).toBeAttached();

    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(violations.map((v) => v.id)).toEqual([]);

    await page.keyboard.press("Escape");
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator(".vs-label")).toHaveCount(0);
    await expect(page.locator("[data-vs-tagged]")).toHaveCount(0);
  });
}

test("the backtick key toggles view source on the resume, and stays out of print", async ({ page }) => {
  await page.goto("/resume.html");
  await page.keyboard.press("`");
  await expect(page.locator("html")).toHaveAttribute("data-view-source", "on");
  await expect(page.locator(".vs-label").filter({ hasText: '<h2 id="experience-title">' })).toHaveCount(1);

  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".vs-layer")).toBeHidden();
  await page.emulateMedia({ media: "screen" });

  await page.keyboard.press("`");
  await expect(page.locator("html")).toHaveAttribute("data-view-source", "off");
});
