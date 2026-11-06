import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/* The announcement bar: shows on both pages, stays clear of the header, dismisses for the session. */

const PAGES = ["/", "/resume.html"];

async function open(page, path, theme = "day") {
  await page.addInitScript((t) => {
    localStorage.setItem("chibi-theme", t);
    localStorage.setItem("chibi-motion", "off");
    localStorage.setItem("chibi-cookie-peek", "dismissed");
  }, theme);
  await page.goto(path);
}

for (const path of PAGES) {
  test(`${path}: the bar says the site is under construction and the header sits below it`, async ({ page }) => {
    await open(page, path);
    const bar = page.getByRole("region", { name: "Site announcement" });
    await expect(bar).toBeVisible();
    await expect(bar).toContainText("Site is still under construction");

    // The emoji is decoration; the words carry the message.
    await expect(bar.locator('[aria-hidden="true"]', { hasText: "🚧" })).toHaveCount(1);

    const barBox = await bar.boundingBox();
    const headerBox = await page.locator(".site-header").boundingBox();
    expect(headerBox.y).toBeGreaterThanOrEqual(barBox.y + barBox.height - 1);
  });

  test(`${path}: dismissing hides the bar, hands focus to the page, and stays dismissed for the session`, async ({
    page,
  }) => {
    await open(page, path);
    const bar = page.getByRole("region", { name: "Site announcement" });
    await page.getByRole("button", { name: "Dismiss announcement" }).click();
    await expect(bar).toBeHidden();
    await expect(page.locator("#main-content")).toBeFocused();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--announce-h").trim())).toBe(
      "0px"
    );

    await page.reload();
    await expect(bar).toBeHidden();
  });

  for (const theme of ["day", "night"]) {
    test(`${path}: the bar passes axe in ${theme}`, async ({ page }) => {
      await open(page, path, theme);
      await expect(page.getByRole("region", { name: "Site announcement" })).toBeVisible();
      const results = await new AxeBuilder({ page })
        .include(".announcement-bar")
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
}

test("the bar never covers a nav link at phone width", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await open(page, "/");
  const bar = await page.locator(".announcement-bar").boundingBox();
  const wordmark = await page.locator(".wordmark").boundingBox();
  expect(wordmark.y).toBeGreaterThanOrEqual(bar.y + bar.height - 1);
});
