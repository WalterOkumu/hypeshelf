import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E config for HypeShelf (Next.js 16).
 * Run: pnpm exec playwright test
 * Requires dev server (or set CI=1 to start via webServer).
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm run dev",
    url: "http://localhost:3000",
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
});
