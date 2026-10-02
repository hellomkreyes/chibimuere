import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/* My Pictures: select, open, step through, close; and the no-JS links. */

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("chibi-theme", "night");
    localStorage.setItem("chibi-motion", "off"); // axe reads colours at rest, not mid-fade
    localStorage.setItem("chibi-cookie-peek", "dismissed");
  });
  await page.goto("/#artsy");
  await expect(page.locator(".pics")).toHaveAttribute("data-section-ready", "");
});

test("click selects, a second click opens; Next, axe, and Escape back to the thumbnail", async ({ page }) => {
  const thumbs = page.locator("[data-pic]");
  const viewer = page.locator("[data-pics-viewer]");
  await expect(page.locator("[data-pics-count]")).toContainText(`${(await thumbs.count()) - 1} items`);

  await thumbs.nth(1).click();
  await expect(thumbs.nth(1)).toHaveAttribute("aria-current", "true");
  await expect(viewer).toBeHidden();

  await thumbs.nth(1).click();
  await expect(viewer).toBeVisible();
  await expect(viewer).toBeFocused();
  const first = await page.locator("[data-pics-caption]").textContent();

  await page.locator("[data-pics-next]").click();
  await expect(page.locator("[data-pics-caption]")).not.toHaveText(first);
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(violations.map((v) => v.id)).toEqual([]);

  await viewer.press("Escape");
  await expect(viewer).toBeHidden();
  await expect(thumbs.nth(2)).toBeFocused();
});

test("Enter opens a picture, and every thumbnail links to a real file", async ({ page, request }) => {
  const thumb = page.locator("[data-pic]").first();
  await thumb.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-pics-viewer]")).toBeVisible();

  for (const href of await page.locator("[data-pic]").evaluateAll((links) => links.map((a) => a.getAttribute("href")))) {
    expect((await request.get(href)).status(), href).toBe(200);
  }
});
