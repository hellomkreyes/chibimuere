import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/* Dream Blunt Rotation: passing the joint, and Auto-pass can be paused. */

async function openRotation(page, { theme, motion }) {
  await page.addInitScript(
    ([theme, motion]) => {
      localStorage.setItem("chibi-theme", theme);
      localStorage.setItem("chibi-motion", motion);
      localStorage.setItem("chibi-cookie-peek", "dismissed");
    },
    [theme, motion]
  );
  await page.goto("/#fartsy");
  await page.locator(".rot").scrollIntoViewIfNeeded(); // sections load as they come near the viewport
  await expect(page.locator(".rot")).toHaveAttribute("data-section-ready", "");
}

test("Puff, puff, pass moves the joint and announces the new holder once", async ({ page }) => {
  await openRotation(page, { theme: "night", motion: "on" });
  const seats = page.locator("[data-rot-seat]");
  const status = page.locator("[data-rot-status]");
  await expect(seats.first()).toHaveClass(/is-holding/);
  await expect(status).toHaveText("");

  await page.getByRole("button", { name: "Puff, puff, pass" }).click();
  await expect(seats.nth(1)).toHaveClass(/is-holding/);
  const name = await seats.nth(1).locator(".rot-name").textContent();
  await expect(status).toContainText(`${name} has it:`);
  await expect(page.locator("[data-rot-bubble]")).toHaveAttribute("aria-hidden", "true");

  // The night question types out letter by letter; SplitText removes its wrappers when done.
  await expect(page.locator("[data-rot-question] div")).toHaveCount(0);
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(violations.map((v) => v.id)).toEqual([]);
});

test("Auto-pass passes on its own and can be paused", async ({ page }) => {
  await openRotation(page, { theme: "day", motion: "off" });
  const auto = page.locator("[data-rot-auto]");
  await auto.click();
  await expect(auto).toHaveAttribute("aria-pressed", "true");
  await expect(auto).toHaveText("Pause auto-pass");
  await expect(page.locator("[data-rot-seat]").nth(1)).toHaveClass(/is-holding/, { timeout: 5000 });

  await auto.click();
  await expect(auto).toHaveAttribute("aria-pressed", "false");
  const holding = await page.locator(".rot-seat.is-holding .rot-name").textContent();
  await page.waitForTimeout(3600);
  await expect(page.locator(".rot-seat.is-holding .rot-name")).toHaveText(holding);
});
