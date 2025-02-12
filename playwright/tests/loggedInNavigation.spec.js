import { test, expect } from "@playwright/test";

test.describe("Logged in navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page
      .getByRole("banner")
      .locator("a")
      .filter({ hasText: "Sign in" })
      .click();
    await page
      .getByRole("link", { name: "My Points" })
      .waitFor({ state: "visible", timeout: 5000 });
  });

  test("should navigate to Find Challenges", async ({ page }) => {
    await page
      .getByRole("navigation")
      .getByRole("link", { name: "Find Challenges" })
      .click();
    await expect(
      page.getByRole("heading", { name: "Challenges" }).locator("span")
    ).toBeVisible();
  });
});
