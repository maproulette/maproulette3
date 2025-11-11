import { expect, test } from '@playwright/test'

test.describe('Authentication', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test.beforeEach(async ({ context, page }) => {
    // Clear all cookies first
    await context.clearCookies()
    
    // Navigate to the page first so we have access to storage on the correct origin
    await page.goto('/')
    
    // Clear session storage and local storage
    await page.evaluate(() => {
      sessionStorage.clear()
      localStorage.clear()
    })
    
    // Reload the page to ensure it loads with clean storage
    await page.reload()
  })

  test('should show sign in option', async ({ page }) => {
    // Page is already loaded from beforeEach

    // Look for sign in button on the page
    const signInButton = page.getByRole('button', { name: 'Sign in' }).first()

    // Should be visible
    await expect(signInButton).toBeVisible({ timeout: 10000 })
  })

  test('should navigate to OSM login when sign in clicked', async ({ page }) => {
    // Page is already loaded from beforeEach
    // Click sign in button (use first one found)
    await page.getByRole('button', { name: 'Sign in' }).first().click()

    // Wait for navigation to OSM login page
    await page.waitForLoadState('networkidle')

    // Verify we're on OSM login page by checking for username/password fields
    await expect(page.locator('#username')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('#password')).toBeVisible({ timeout: 5000 })
  })

  test('should show sign in link when not authenticated', async ({ page }) => {
    // Page is already loaded from beforeEach
    
    // Look for sign in button (should be visible when not logged in)
    // Don't restrict to header - button could be in navigation or main content
    const signInButton = page.getByRole('button', { name: 'Sign in' }).first()

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')
    
    const isVisible = await signInButton.isVisible({ timeout: 10000 }).catch(() => false)

    expect(isVisible).toBeTruthy()
  })
})
