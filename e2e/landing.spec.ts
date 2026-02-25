import { test, expect } from "@playwright/test";

test.describe("Public landing page", () => {
  test("loads and shows HypeShelf branding", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /HypeShelf/i }).first()).toBeVisible();
  });

  test("has sign-in entry for guests", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /Sign in/i }).first()).toBeVisible();
  });

  test("has Latest Picks section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Latest Picks/i })).toBeVisible();
  });

  test("unauthenticated visit to dashboard redirects to sign-in", async ({ page }) => {
    await page.goto("/dashboard");
    const url = page.url();
    const redirectedToAuth =
      /(sign-in|sign-up|login)/.test(url) || /clerk\.com/.test(url);
    expect(redirectedToAuth).toBe(true);
  });
});
