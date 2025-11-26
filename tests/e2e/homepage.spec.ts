import { expect, test } from '@playwright/test'

test.describe('Homepage', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies()
    await page.goto('/')
    await page.evaluate(() => {
      sessionStorage.clear()
      localStorage.clear()
    })
    await page.reload()
  })

  test('should load homepage successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Dashboard|MapRoulette/i)

    const mainContent = page.locator('main, [role="main"], #root')
    await expect(mainContent).toBeVisible()

    const signInPrompt = page.locator('text=Please sign in')
    const dashboard = page.locator('main')

    const hasContent =
      (await signInPrompt.isVisible().catch(() => false)) ||
      (await dashboard.isVisible().catch(() => false))
    expect(hasContent).toBeTruthy()
  })

  test('should have navigation header', async ({ page }) => {
    const header = page.locator('header, nav, [role="navigation"]').first()
    await expect(header).toBeVisible()
  })

  test('should display MapRoulette logo or branding', async ({ page }) => {
    const header = page.locator('header').first()
    await expect(header).toBeVisible({ timeout: 5000 })

    const logo = header.locator('img').first()
    const brandLink = header.locator('a').first()

    const logoVisible = await logo.isVisible().catch(() => false)
    const linkVisible = await brandLink.isVisible().catch(() => false)

    expect(logoVisible || linkVisible).toBeTruthy()
  })
})
