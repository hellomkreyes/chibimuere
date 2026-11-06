import { test, expect } from "@playwright/test";

/* Case studies: a row of cards on wide screens, a swipeable carousel with
   star buttons on phones. Checks structure and behaviour, not the copy. */

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("chibi-theme", "night");
    localStorage.setItem("chibi-motion", "off");
    localStorage.setItem("chibi-cookie-peek", "dismissed");
  });
  await page.goto("/");
  await page.locator(".cases-section").scrollIntoViewIfNeeded();
});

test("every card has a star, the first star is current, and every star is named", async ({ page }) => {
  const slides = page.locator(".cases-section [data-case-slide]");
  const stars = page.locator(".cases-section [data-case-star]");
  const count = await slides.count();
  expect(count).toBeGreaterThan(0);
  await expect(stars).toHaveCount(count);
  await expect(stars.first()).toHaveAttribute("aria-current", "true");
  for (const star of await stars.all()) {
    expect(await star.getAttribute("aria-label")).toBeTruthy();
  }
});

test("card links open in a new tab with a safe rel", async ({ page }) => {
  const links = page.locator(".case-links a");
  expect(await links.count()).toBeGreaterThan(0);
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
    expect(await link.getAttribute("href")).toMatch(/^https:\/\//);
  }
});

test("phone: a star scrolls to its card and becomes current", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator(".cases-section .case-pager").scrollIntoViewIfNeeded();
  const stars = page.locator(".cases-section [data-case-star]");
  await expect(stars.first()).toBeVisible();
  await stars.nth(1).click();
  await expect(stars.nth(1)).toHaveAttribute("aria-current", "true");
  await expect(stars.first()).toHaveAttribute("aria-current", "false");
  await expect
    .poll(() => page.locator(".cases-section [data-cases-track]").evaluate((track) => track.scrollLeft))
    .toBeGreaterThan(0);
});

test("phone: swiping the track moves the current star", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const track = page.locator(".cases-section [data-cases-track]");
  await track.evaluate((el) => {
    el.scrollTo({ left: el.scrollWidth, behavior: "instant" });
  });
  const last = page.locator(".cases-section [data-case-star]").last();
  await expect(last).toHaveAttribute("aria-current", "true");
});

test("wide screens show the cards as a grid and hide the stars", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(page.locator(".cases-section [data-case-star]").first()).toBeHidden();
  const columns = await page.locator(".cases-section [data-cases-track]").evaluate(
    (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length,
  );
  expect(columns).toBe(3);
});

/* Project cards: the same carousel on phones, the plain grid from tablet up. */

test("projects: a swipeable row with stars on phones, the grid and no stars on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const track = page.locator(".portfolio-section [data-cases-track]");
  const stars = page.locator(".portfolio-section [data-case-star]");
  await track.scrollIntoViewIfNeeded();
  const count = await page.locator(".portfolio-section [data-case-slide]").count();
  expect(count).toBeGreaterThan(0);
  await expect(stars).toHaveCount(count);
  await expect(stars.first()).toBeVisible();
  expect(await track.evaluate((el) => getComputedStyle(el).overflowX)).toBe("auto");

  await stars.nth(1).click();
  await expect(stars.nth(1)).toHaveAttribute("aria-current", "true");
  await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);

  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(stars.first()).toBeHidden();
  expect(await track.evaluate((el) => getComputedStyle(el).display)).toBe("grid");
});
