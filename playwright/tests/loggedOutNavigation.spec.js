import { test, expect } from '@playwright/test';

// Create a new test fixture that doesn't use the stored auth state
test.describe('Logged out navigation', () => {
  // Use a new context for these tests without the stored auth state
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => { 
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveTitle(/MapRoulette/);
  });

  test('should load find challenges page', async ({ page }) => {
    await page.getByRole('navigation').getByRole('link', { name: 'Find Challenges' }).click();
    await expect(page.getByRole('heading', { name: 'Challenges' }).locator('span')).toBeVisible();
    await expect(page.locator('a').filter({ hasText: 'Sign in' })).toBeVisible();
  });

  test('should load leaderboard page', async ({ page }) => {
    await page.getByRole('navigation').getByRole('link', { name: 'Leaderboard' }).click();
    await page.waitForLoadState('networkidle');
  });

  test('should load learn page', async ({ page }) => {
    await page.getByRole('navigation').getByRole('link', { name: 'Learn' }).click();
    await page.waitForLoadState('networkidle');
  });

  test('should load blog page', async ({ page }) => {
    await page.getByRole('navigation').getByRole('link', { name: 'Blog' }).click();
    await page.waitForLoadState('networkidle');
  });

  test('should load donate page', async ({ page }) => {
    await page.getByRole('navigation').getByRole('link', { name: 'Donate' }).click();
    await page.waitForLoadState('networkidle');
  });
});

