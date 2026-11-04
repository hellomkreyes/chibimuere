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
  const log = page.locator("[data-msn-log] .msn-system");
  const before = await log.count();
  await page.locator('[data-wink="butterflies"]').click();

  await expect(log).toHaveCount(before + 1);
  const overlay = page.locator(".wink-overlay");
  await expect(overlay).toBeVisible();
  await expect(overlay).toHaveAttribute("aria-hidden", "true");

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);

  // axe can outlast the ~3 s wink, so send a fresh one before using Skip.
  await page.locator('[data-wink="butterflies"]').click();
  await page.locator("[data-wink-skip]").click();
  await expect(overlay).toBeHidden();
  await expect(page.locator("[data-wink-skip]")).toBeHidden();
  await expect(page.locator('[data-wink="butterflies"]')).toBeFocused();
});

test("with motion off, a wink only adds the log line", async ({ page }) => {
  await openBio(page, { theme: "day", motion: "off" });
  const log = page.locator("[data-msn-log] .msn-system");
  const before = await log.count();
  await page.locator('[data-wink="moon"]').click();

  await expect(log).toHaveCount(before + 1);
  await expect(page.locator(".wink-overlay")).toBeHidden();
  await expect(page.locator("[data-wink-skip]")).toBeHidden();
});

/* Arrival: the latest message slides in when the window scrolls into view. */

const latestLine = (page) => page.locator("[data-msn-log] .msn-line:not(.msn-system)").last();

test("the latest message waits offscreen, then slides in when the window scrolls into view", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("chibi-theme", "day");
    localStorage.setItem("chibi-motion", "on");
  });
  await page.goto("/");
  await expect(page.locator("[data-msn]")).toHaveAttribute("data-section-ready", "");
  // Section code loads a screen early; the message stays tucked away until the window is in view.
  await expect(latestLine(page)).toHaveCSS("opacity", "0");

  await page.locator("[data-msn]").scrollIntoViewIfNeeded();
  await expect(latestLine(page)).toHaveCSS("opacity", "1");
  await expect(latestLine(page)).toBeVisible();
});

test("with motion off, the latest message is simply there", async ({ page }) => {
  await openBio(page, { theme: "day", motion: "off" });
  await expect(latestLine(page)).toHaveCSS("opacity", "1");
});
