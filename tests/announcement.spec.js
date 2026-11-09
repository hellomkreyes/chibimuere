import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/* The announcement bar: shows on both pages, stays clear of the header, dismisses for the session. */

const PAGES = ["/", "/resume.html"];

async function open(page, path, theme = "day", motion = "off") {
  await page.addInitScript(
    ([t, m]) => {
      localStorage.setItem("chibi-theme", t);
      localStorage.setItem("chibi-motion", m);
      localStorage.setItem("chibi-cookie-peek", "dismissed");
    },
    [theme, motion],
  );
  await page.goto(path);
}

for (const path of PAGES) {
  test(`${path}: the bar says the site is under construction and the header sits below it`, async ({
    page,
  }) => {
    await open(page, path);
    const bar = page.getByRole("region", { name: "Site announcement" });
    await expect(bar).toBeVisible();
    await expect(bar).toContainText("Site is still under construction");

    // The emoji is decoration; the words carry the message.
    await expect(
      bar.locator('[aria-hidden="true"]', { hasText: "🚧" }).first(),
    ).toBeAttached();

    // Screen readers get the message exactly once: every marquee copy is aria-hidden.
    const readable = await bar.evaluate(
      (el) =>
        [...el.querySelectorAll(".announcement-item")].filter(
          (i) => !i.closest('[aria-hidden="true"]'),
        ).length,
    );
    expect(readable).toBe(1);

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
    expect(
      await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue("--announce-h")
          .trim(),
      ),
    ).toBe("0px");

    await page.reload();
    await expect(bar).toBeHidden();
  });

  for (const theme of ["day", "night"]) {
    test(`${path}: the bar passes axe in ${theme}`, async ({ page }) => {
      await open(page, path, theme);
      await expect(
        page.getByRole("region", { name: "Site announcement" }),
      ).toBeVisible();
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

test("with motion on, the bar loops a marquee and the caution tape marches", async ({
  page,
}) => {
  await open(page, "/", "day", "on");
  const track = page.locator("[data-announcement-track]");
  await expect(track).toHaveClass(/is-marquee/);
  expect(await track.evaluate((el) => getComputedStyle(el).animationName)).toBe(
    "announcement-slide",
  );
  expect(
    await page
      .locator(".announcement-bar")
      .evaluate((el) => getComputedStyle(el, "::before").animationName),
  ).toBe("announcement-tape");

  // The two halves match and each is at least as wide as the bar, so the loop has no gap.
  const widths = await page.evaluate(() => {
    const [a, b] = document.querySelectorAll(".announcement-half");
    return {
      a: a.scrollWidth,
      b: b.scrollWidth,
      bar: document.querySelector(".announcement-bar").clientWidth,
    };
  });
  expect(widths.a).toBe(widths.b);
  expect(widths.a).toBeGreaterThanOrEqual(widths.bar);
});

test("with motion paused, one still centred message is left", async ({
  page,
}) => {
  await open(page, "/", "day", "off");
  const bar = page.locator(".announcement-bar");
  expect(
    await page
      .locator("[data-announcement-track]")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  await expect(bar.locator(".announcement-item:visible")).toHaveCount(1);
});

for (const theme of ["day", "night"]) {
  test(`the marquee text keeps 4.5:1 contrast in ${theme}`, async ({
    page,
  }) => {
    await open(page, "/", theme);
    const [fg, bg] = await page.locator(".announcement-bar").evaluate((el) => {
      const cs = getComputedStyle(el);
      return [cs.color, cs.backgroundColor];
    });
    const lum = (rgb) => {
      const [r, g, b] = rgb
        .match(/\d+/g)
        .slice(0, 3)
        .map((v) => {
          const c = v / 255;
          return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const [hi, lo] = [lum(fg), lum(bg)].sort((a, b) => b - a);
    expect((hi + 0.05) / (lo + 0.05)).toBeGreaterThanOrEqual(4.5);
  });
}
