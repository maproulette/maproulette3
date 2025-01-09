// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Navigation (Logged In)', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:3000');
    await page.locator('a').filter({ hasText: 'Sign in' }).click();
    await page.getByLabel('Email Address or Username').fill(process.env.REACT_APP_USERNAME || "");
    await page.getByLabel('Password').fill(process.env.REACT_APP_PASSWORD || "");
    await page.getByRole('button', { name: 'Log in' }).click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveTitle(/MapRoulette/);
  });

  test('should navigate to Find Chalslenges', async ({ page }) => {
    await page.getByRole('navigation').getByRole('link', { name: 'Find Challenges' }).click();
    await expect(page.getByRole('heading', { name: 'Challenges' }).locator('span')).toBeVisible();
  });
});
