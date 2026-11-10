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
  await page.locator(".pics").scrollIntoViewIfNeeded(); // sections load as they come near the viewport
  await expect(page.locator(".pics")).toHaveAttribute("data-section-ready", "");
});

test("click selects, a second click opens; Next, axe, and Escape back to the thumbnail", async ({ page }) => {
  const thumbs = page.locator("li:not([hidden]) > [data-pic]");
  const viewer = page.locator("[data-pics-viewer]");
  await expect(page.locator("[data-pics-count]")).toContainText(String(await thumbs.count()));

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
  const thumb = page.locator("li:not([hidden]) > [data-pic]").first();
  await thumb.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-pics-viewer]")).toBeVisible();

  for (const href of await page.locator("[data-pic]").evaluateAll((links) => links.map((a) => a.getAttribute("href")))) {
    expect((await request.get(href)).status(), href).toBe(200);
  }
});

test("folders filter the grid, and the Recycle Bin is always there but keeps its items to itself", async ({ page }) => {
  const shown = page.locator("li:not([hidden]) > [data-pic]");
  const count = page.locator("[data-pics-count-num]");
  await expect(count).toHaveText("13");
  await expect(page.getByRole("button", { name: "Recycle Bin" })).toBeVisible();
  await expect(page.getByLabel("Show hidden items")).toHaveCount(0);

  await page.getByRole("button", { name: "japan_2024" }).click();
  await expect(shown).toHaveCount(1);
  await expect(page.getByRole("button", { name: "japan_2024" })).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "fandom_irl" }).click();
  await expect(shown).toHaveCount(2);

  await page.getByRole("button", { name: "Recycle Bin" }).click();
  await expect(shown).toHaveCount(4); // the bin's three plus the loose Thumbs.db
  await expect(count).toHaveText("3"); // Thumbs.db is not counted

  await page.getByRole("button", { name: "All pictures" }).click();
  await expect(shown).toHaveCount(13);
});

test("Previous and Next stay inside the open folder", async ({ page }) => {
  await page.getByRole("button", { name: "games_and_concerts" }).click();
  const shown = page.locator("li:not([hidden]) > [data-pic]");
  await shown.first().focus();
  await page.keyboard.press("Enter");
  const caption = page.locator("[data-pics-caption]");
  await expect(caption).toContainText("tbp_toronto_2025.jpg");
  await page.locator("[data-pics-next]").click();
  await expect(caption).toContainText("lnd_mc_valko_gone.jpg");
  await page.locator("[data-pics-next]").click();
  await expect(caption).toContainText("pokopia_cubone.jpg");
  await page.locator("[data-pics-next]").click();
  await expect(caption).toContainText("tbp_toronto_2025.jpg");
});
