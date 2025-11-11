import { expect, test } from '@playwright/test'

test.describe('Homepage', () => {
  // These tests should run unauthenticated
  test.use({ storageState: { cookies: [], origins: [] } })

  test.beforeEach(async ({ context, page }) => {
    // Clear all cookies and storage
    await context.clearCookies()
    await page.goto('/')
    await page.evaluate(() => {
      sessionStorage.clear()
      localStorage.clear()
    })
    await page.reload()
  })

  test('should load homepage successfully', async ({ page }) => {
    // Page is already loaded from beforeEach

    // When not logged in, the app shows Dashboard with "Please sign in" message
    await expect(page).toHaveTitle(/Dashboard|MapRoulette/i)

    // Check for main content
    const mainContent = page.locator('main, [role="main"], #root')
    await expect(mainContent).toBeVisible()

    // Should see either the dashboard or sign in prompt
    const signInPrompt = page.locator('text=Please sign in')
    const dashboard = page.locator('main')

    // At least one should be visible
    const hasContent =
      (await signInPrompt.isVisible().catch(() => false)) ||
      (await dashboard.isVisible().catch(() => false))
    expect(hasContent).toBeTruthy()
  })

  test('should have navigation header', async ({ page }) => {
    // Page is already loaded from beforeEach

    // Look for header/nav elements
    const header = page.locator('header, nav, [role="navigation"]').first()
    await expect(header).toBeVisible()
  })

  test('should display MapRoulette logo or branding', async ({ page }) => {
    // Page is already loaded from beforeEach

    // Look for header element (may not have banner role)
    const header = page.locator('header').first()
    await expect(header).toBeVisible({ timeout: 5000 })

    // Look for logo or MapRoulette branding
    const logo = header.locator('img').first()
    const brandLink = header.locator('a').first()

    // At least one should be visible
    const logoVisible = await logo.isVisible().catch(() => false)
    const linkVisible = await brandLink.isVisible().catch(() => false)

    expect(logoVisible || linkVisible).toBeTruthy()
  })
})
