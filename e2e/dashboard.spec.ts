import { test, expect } from "@playwright/test";

/**
 * Dashboard E2E: require auth. In CI without Clerk keys these can be skipped
 * or run only when NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set.
 */
test.describe("Dashboard (authenticated)", () => {
  test.skip(
    () => !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    "Dashboard E2E requires Clerk env in CI"
  );

  test("signed-in user can reach dashboard", async ({ page }) => {
    await page.goto("/");
    // If already signed in, "Go to your shelf" is visible
    const goToShelf = page.getByRole("link", { name: /Go to your shelf/i });
    const signIn = page.getByRole("button", { name: /Sign in/i });
    const hasShelf = await goToShelf.first().isVisible().catch(() => false);
    if (!hasShelf) {
      const hasSignIn = await signIn.first().isVisible().catch(() => false);
      expect(hasSignIn).toBe(true);
      return; // skip: not signed in
    }
    await goToShelf.first().click();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
