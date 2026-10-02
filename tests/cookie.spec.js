import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/* Cookie corner: the one-time peek, and the policy opened from the cookie. */

test("the peek shows once, and accepting it is remembered", async ({ page }) => {
  await page.goto("/");
  const peek = page.locator("[data-cookie-peek]");
  await expect(peek).toBeVisible();
  await expect(page.locator(".cookie-corner [role=status]")).toContainText("psst. 0 cookies here.");

  await page.getByRole("button", { name: "Accept all 0" }).click();
  await expect(peek).toBeHidden();
  await page.reload();
  await expect(page.locator("[data-cookie-jar]")).toBeVisible();
  await page.waitForTimeout(1500); // longer than the peek delay
  await expect(peek).toBeHidden();
});

test("the cookie opens the policy; Escape closes it and returns focus; no axe violations", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("chibi-theme", "night");
    localStorage.setItem("chibi-cookie-peek", "dismissed");
  });
  await page.goto("/resume.html");
  const jar = page.locator("[data-cookie-jar]");
  await jar.click();

  const policy = page.getByRole("dialog", { name: "crumbs only." });
  await expect(policy).toBeVisible();
  await expect(policy).toBeFocused();
  await expect(jar).toHaveAttribute("aria-expanded", "true");
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(violations.map((v) => v.id)).toEqual([]);

  await page.keyboard.press("Escape");
  await expect(policy).toBeHidden();
  await expect(jar).toBeFocused();
  await expect(jar).toHaveAttribute("aria-expanded", "false");
});
