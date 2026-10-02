import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/* Webring: ring nav, the button wall, filter chips, and Boost it. */

test.beforeEach(async ({ page, context, browserName }) => {
  if (browserName === "chromium") await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.addInitScript(() => {
    localStorage.setItem("chibi-theme", "night");
    localStorage.setItem("chibi-cookie-peek", "dismissed");
    delete navigator.share; // test the copy-the-link path
  });
  await page.goto("/#artsy");
  await expect(page.locator(".ring")).toHaveAttribute("data-section-ready", "");
});

test("next, the button wall and the filter chips change the featured entry", async ({ page }) => {
  const entries = page.locator("[data-ring-entry]:not([hidden])");
  const position = page.locator("[data-ring-pos]");
  await expect(entries).toHaveCount(1);
  await expect(position).toHaveText(/^1 of \d+$/);
  const first = await entries.locator(".ring-name").textContent();

  await page.locator("[data-ring-next]").click();
  await expect(entries.locator(".ring-name")).not.toHaveText(first);
  await expect(page.locator("[data-ring-status]")).toContainText("2 of");

  await page.locator("[data-ring-pick]").first().click();
  await expect(entries.locator(".ring-name")).toHaveText(first);

  const chips = page.locator(".ring-chip");
  await chips.nth(1).click();
  await expect(chips.nth(1)).toHaveAttribute("aria-pressed", "true");
  await expect(position).toHaveText(/^1 of 1$/);

  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(violations.map((v) => v.id)).toEqual([]);
});

test("Boost it copies the link", async ({ page }) => {
  const entry = page.locator("[data-ring-entry]:not([hidden])");
  const boost = entry.locator("[data-ring-boost]");
  await boost.click();
  await expect(boost).toHaveText("Link copied!");
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toBe(await entry.getAttribute("data-url"));
});
