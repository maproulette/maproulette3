import { test, expect } from '@playwright/test';

test.describe('Logged in navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Use cached version of the page
    await page.goto(process.env.REACT_APP_PLAYWRIGHT_URL, {
      waitUntil: 'networkidle',
    });
    
    // Verify logged in state
    await expect(async () => {
      const signInLink = page.locator('a').filter({ hasText: 'Sign in' });
      await expect(signInLink).not.toBeVisible();
      await expect(page.locator('.navbar-logged-in')).toBeVisible();
    }).toPass({ timeout: 10000 });
  });

  test('should navigate to Find Challenges', async ({ page }) => {
    await page.getByRole('navigation').getByRole('link', { name: 'Find Challenges' }).click();
    await expect(page.getByRole('heading', { name: 'Challenges' }).locator('span')).toBeVisible();
  });
});
