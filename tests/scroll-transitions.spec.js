import { test, expect } from "@playwright/test";

/* Scroll transitions: seams behind each big section, and headings that split and settle while motion is on. */

test("headings split while motion is on and come back whole when it's paused", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("chibi-motion", "on");
    localStorage.setItem("chibi-cookie-peek", "dismissed");
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");

  await expect(page.locator(".has-seams > .seams")).toHaveCount(5);
  const heading = page.locator("#artsy-title");
  await heading.scrollIntoViewIfNeeded();
  await expect(heading.locator(".st-char").first()).toBeAttached();
  await expect(heading).toHaveAccessibleName("Artsy");

  await page.locator(".motion-icon").click();
  await expect(heading.locator(".st-char")).toHaveCount(0);
  await expect(heading).toHaveText("Artsy");
  await expect(page.locator(".seams span").first()).not.toHaveAttribute("style", /scale/);
  expect(errors).toEqual([]);
});

test("the Artsy windows rise into place while motion is on and sit still when it's paused", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("chibi-motion", "on");
    localStorage.setItem("chibi-cookie-peek", "dismissed");
  });
  await page.goto("/");
  const windowEl = page.locator(".artsy-section > .shell > .pics");
  await windowEl.scrollIntoViewIfNeeded();
  await expect.poll(() => windowEl.evaluate((el) => el.style.transform)).not.toBe("");

  await page.locator(".motion-icon").click();
  await expect.poll(() => windowEl.evaluate((el) => el.style.transform)).toBe("");
  await expect.poll(() => windowEl.evaluate((el) => el.style.opacity)).toBe("");
});

test("with reduced motion the seams are drawn and nothing is split", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/resume.html");
  await expect(page.locator(".has-seams > .seams").first()).toBeAttached();
  await page.locator("#experience-title").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await expect(page.locator(".st-char")).toHaveCount(0);
  await expect(page.locator("#experience-title")).toHaveText("Experience");
});
