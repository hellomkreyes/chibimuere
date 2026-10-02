import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/* Bio messenger winks: the main interaction, with motion on and off. */

async function openBio(page, { theme, motion }) {
  await page.addInitScript(
    ([theme, motion]) => {
      localStorage.setItem("chibi-theme", theme);
      localStorage.setItem("chibi-motion", motion);
    },
    [theme, motion]
  );
  await page.goto("/#bio");
  await expect(page.locator("[data-msn]")).toHaveAttribute("data-section-ready", "");
}

test("a wink logs itself, plays over the page, and Skip ends it", async ({ page }) => {
  await openBio(page, { theme: "night", motion: "on" });
  await page.locator('[data-wink="butterflies"]').click();

  await expect(page.locator("[data-msn-log] .msn-system").last()).toHaveText("You have sent a wink: moth flutter");
  const overlay = page.locator(".wink-overlay");
  await expect(overlay).toBeVisible();
  await expect(overlay).toHaveAttribute("aria-hidden", "true");

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);

  await page.locator("[data-wink-skip]").click();
  await expect(overlay).toBeHidden();
  await expect(page.locator("[data-wink-skip]")).toBeHidden();
  await expect(page.locator('[data-wink="butterflies"]')).toBeFocused();
});

test("with motion off, a wink only adds the log line", async ({ page }) => {
  await openBio(page, { theme: "day", motion: "off" });
  await page.locator('[data-wink="moon"]').click();

  await expect(page.locator("[data-msn-log] .msn-system").last()).toHaveText("You have sent a wink: moon sparkles");
  await expect(page.locator(".wink-overlay")).toBeHidden();
  await expect(page.locator("[data-wink-skip]")).toBeHidden();
});
