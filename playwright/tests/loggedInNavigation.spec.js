import { test, expect } from '@playwright/test';

test.describe('Logged in navigation', () => {
  test.use({ storageState: './state.json' });
  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.REACT_APP_PLAYWRIGHT_URL);
    await page.waitForLoadState('networkidle');
    await page.getByRole('banner').locator('a').filter({ hasText: 'Sign in' }).click();
  });

  test('should navigate to Find Challenges', async ({ page }) => {
    await page.getByRole('navigation').getByRole('link', { name: 'Find Challenges' }).click();
    await expect(page.getByRole('heading', { name: 'Challenges' }).locator('span')).toBeVisible();
  });
});
