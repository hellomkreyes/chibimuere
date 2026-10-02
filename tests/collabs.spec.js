import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/* Dream Collabs: a node and line per collab, picking one shows its details. */

test.describe("with JS", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("chibi-theme", "night");
      localStorage.setItem("chibi-motion", "off");
      localStorage.setItem("chibi-cookie-peek", "dismissed");
    });
    await page.goto("/#fartsy");
    await expect(page.locator(".ship")).toHaveAttribute("data-section-ready", "");
  });

  test("every collab gets a node and a dashed fanon line; picking one shows its details", async ({ page }) => {
    const count = await page.locator("[data-ship]").count();
    const nodes = page.locator(".ship-node:not(.ship-center)");
    await expect(nodes).toHaveCount(count);
    await expect(page.locator(".ship-line")).toHaveCount(count);
    await expect(page.locator(".ship-line.is-canon")).toHaveCount(await page.locator("[data-ship][data-canon]").count());
    await expect(nodes.first()).toHaveAttribute("aria-pressed", "true");

    await nodes.nth(2).click();
    await expect(nodes.nth(2)).toHaveAttribute("aria-pressed", "true");
    await expect(nodes.first()).toHaveAttribute("aria-pressed", "false");
    const name = await page.locator("[data-ship]").nth(2).getAttribute("data-name");
    await expect(page.locator("[data-ship-detail] .ship-name")).toContainText(name.replace("&amp;", "&"));
    await expect(page.getByRole("link", { name: "Ready to make it canon?" })).toHaveAttribute("href", "#contact");

    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(violations.map((v) => v.id)).toEqual([]);
  });
});

test.describe("without JS", () => {
  test.use({ javaScriptEnabled: false });

  test("the collabs are listed with their details", async ({ page }) => {
    await page.goto("/#fartsy");
    const items = page.locator("[data-ship]");
    await expect(items.first()).toBeVisible();
    await expect(items.first().locator(".ship-status")).toHaveText("fanon");
    await expect(page.locator("[data-ship-chart]")).toBeHidden();
  });
});
