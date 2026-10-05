import { defineConfig, devices } from "@playwright/test";

const CI = Boolean(process.env.CI);

/*
 * End-to-end checks against the production build (vite preview).
 *
 * Screenshot baselines are made on GitHub's Linux runner, since fonts render
 * differently on macOS, so screenshot assertions only run in CI. To create or
 * refresh them, add the "update-screenshots" label to the PR (see
 * .github/workflows/checks.yml).
 */
export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: CI ? [["github"], ["html", { open: "never" }]] : "list",
  ignoreSnapshots: !CI,
  snapshotPathTemplate: "tests/screenshots/{testFilePath}/{arg}-{projectName}{ext}",
  expect: {
    toHaveScreenshot: { animations: "disabled", caret: "hide", maxDiffPixelRatio: 0.01 },
  },
  use: {
    baseURL: "http://localhost:4173",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // Safari's engine: the page + axe checks, plus the Dream Collabs chart layout and the icon sprite (screenshots and other behavior run in Chromium).
    { name: "webkit", use: { ...devices["Desktop Safari"] }, grep: /axe violations|spread around the centre|icons render/ },
  ],
  webServer: {
    command: "npm run preview -- --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: !CI,
  },
});
