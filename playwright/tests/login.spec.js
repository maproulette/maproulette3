import { test, expect } from '@playwright/test';

test.describe('Logged in navigation', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('should login and redirect to maproulette', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('banner').locator('a').filter({ hasText: 'Sign in' }).click();
        await page.getByLabel('Email Address or Username').fill(process.env.REACT_APP_PLAYWRIGHT_USERNAME || "");
        await page.getByLabel('Password').fill(process.env.REACT_APP_PLAYWRIGHT_PASSWORD || "");
        await page.getByRole('button', { name: 'Log in' }).click();
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveTitle(/MapRoulette/);
    });
});
  