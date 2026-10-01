import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/*
 * The critical paths only: every page is accessible and error-free in both
 * themes (Chromium + WebKit), looks the same as its baseline (Chromium, desktop
 * and phone width), and the three things that would really hurt if they broke
 * keep working: the theme toggle, pause motion, and in-page links.
 *
 * Section PRs add one spec per section for its main interaction, plus an axe
 * check of its open state, in day and night.
 */

const PAGES = [
  { name: "home", path: "/" },
  { name: "resume", path: "/resume.html" },
  { name: "404", path: "/404.html" },
];
const THEMES = ["day", "night"];
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/** Opens a page with a saved theme and motion choice, as a returning visitor. */
async function open(page, path, { theme = "day", motion = "on" } = {}) {
  // Seed once per tab, so a reload keeps whatever the test changed since.
  await page.addInitScript(
    ([theme, motion]) => {
      if (sessionStorage.getItem("seeded")) return;
      sessionStorage.setItem("seeded", "1");
      localStorage.setItem("chibi-theme", theme);
      localStorage.setItem("chibi-motion", motion);
    },
    [theme, motion]
  );
  if (motion === "off") await page.emulateMedia({ reducedMotion: "reduce" });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
  return errors;
}

for (const { name, path } of PAGES) {
  for (const theme of THEMES) {
    test.describe(`${name} · ${theme}`, () => {
      test("loads without errors or axe violations", async ({ page }) => {
        const errors = await open(page, path, { theme, motion: "off" });
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        const { violations } = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
        const summary = violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
        expect(summary).toEqual([]);
        expect(errors).toEqual([]);
      });

      test("matches the screenshots", async ({ page }) => {
        // "This year" and "years since" come from the clock; pin it so baselines survive New Year.
        await page.clock.setFixedTime(new Date("2026-10-01T12:00:00"));
        await open(page, path, { theme, motion: "off" });
        // The sparkle canvas and butterfly are randomized; everything else must match.
        const options = { fullPage: true, style: "#fx, .fly { visibility: hidden !important; }" };
        await expect(page).toHaveScreenshot(`${name}-${theme}-desktop.png`, options);
        await page.setViewportSize({ width: 390, height: 844 });
        await expect(page).toHaveScreenshot(`${name}-${theme}-phone.png`, options);
      });
    });
  }
}

test.describe("home", () => {
  test("every in-page link has a target, on both pages", async ({ page }) => {
    await open(page, "/");
    const ids = await page.evaluate(() => [...document.querySelectorAll("[id]")].map((el) => el.id));
    const homeHrefs = await page.locator('a[href^="#"]').evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    await page.goto("/resume.html");
    const resumeHrefs = await page
      .locator('a[href*="index.html#"]')
      .evaluateAll((links) => links.map((a) => a.getAttribute("href").split("#")[1]));
    const missing = [...homeHrefs.map((href) => href.slice(1)), ...resumeHrefs].filter((id) => id && !ids.includes(id));
    expect(missing).toEqual([]);
  });

  test("theme toggle switches day to night and back, and remembers it", async ({ page }) => {
    await open(page, "/", { theme: "day", motion: "off" });
    const html = page.locator("html");
    const toggle = page.locator(".theme-toggle");
    await toggle.click();
    await expect(html).toHaveAttribute("data-theme", "night");
    await page.reload();
    await expect(html).toHaveAttribute("data-theme", "night");
    await toggle.click();
    await expect(html).toHaveAttribute("data-theme", "day");
  });

  test("pause motion buttons stay in sync and remember the choice", async ({ page }) => {
    await open(page, "/", { motion: "on" });
    const toggles = page.locator("[data-motion-toggle]");
    await expect(toggles).toHaveCount(2);
    await page.locator(".motion-toggle").click();
    await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
    for (const toggle of await toggles.all()) await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
  });
});
