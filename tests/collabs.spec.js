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

/* Layout, in every browser we run (WebKit included): the nodes must end up spread around the
   centre inside the chart, not bunched in a corner, at desktop and phone widths. */
test("the chart's nodes and lines end up spread around the centre", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("chibi-motion", "on");
    localStorage.setItem("chibi-cookie-peek", "dismissed");
  });
  await page.goto("/#fartsy");
  await page.locator(".ship").scrollIntoViewIfNeeded();
  await expect(page.locator(".ship")).toHaveAttribute("data-section-ready", "");

  const measure = () =>
    page.evaluate(() => {
      const ship = document.querySelector(".ship");
      const chart = ship.querySelector(".ship-chart").getBoundingClientRect();
      const slots = [...ship.querySelectorAll(".ship-node:not(.ship-center)")].map((n) => n.parentElement);
      const centres = slots.map((slot) => {
        const r = slot.getBoundingClientRect();
        return [r.left + r.width / 2 - chart.left, r.top + r.height / 2 - chart.top];
      });
      const lineGap = [...ship.querySelectorAll(".ship-line")].map((line, i) => {
        const want = [parseFloat(slots[i].style.left), parseFloat(slots[i].style.top)];
        return Math.hypot(parseFloat(line.getAttribute("x2")) - want[0], parseFloat(line.getAttribute("y2")) - want[1]);
      });
      return {
        chart: [chart.width, chart.height],
        spread: [Math.max(...centres.map((c) => c[0])) - Math.min(...centres.map((c) => c[0])), Math.max(...centres.map((c) => c[1])) - Math.min(...centres.map((c) => c[1]))],
        inside: centres.every(([x, y]) => x >= 0 && y >= 0 && x <= chart.width && y <= chart.height),
        lineGap: Math.max(...lineGap),
      };
    });

  for (const [width, height] of [[1280, 900], [390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.locator(".ship").scrollIntoViewIfNeeded();
    // Wait out the entrance animation: every line must reach its node.
    await expect.poll(async () => (await measure()).lineGap, { timeout: 10000 }).toBeLessThan(0.5);
    const m = await measure();
    expect(m.chart[0], `chart width at ${width}`).toBeGreaterThan(250);
    expect(m.chart[1], `chart height at ${width}`).toBeGreaterThan(250);
    expect(m.spread[0], `horizontal spread at ${width}`).toBeGreaterThan(m.chart[0] * 0.5);
    expect(m.spread[1], `vertical spread at ${width}`).toBeGreaterThan(m.chart[1] * 0.5);
    expect(m.inside, `nodes inside the chart at ${width}`).toBe(true);
  }
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
