import { expect, test } from '@playwright/test'

export const registerAuthTests = () => {
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

  test('should show sign in option', async ({ page }) => {
    const signInButton = page.getByRole('button', { name: 'Sign in' }).first()

    await expect(signInButton).toBeVisible({ timeout: 10000 })
  })

  test('should navigate to OSM login when sign in clicked', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign in' }).first().click()

    await page.waitForLoadState('networkidle')

    await expect(page.locator('#username')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('#password')).toBeVisible({ timeout: 5000 })
  })

  test('should show sign in link when not authenticated', async ({ page }) => {
    const signInButton = page.getByRole('button', { name: 'Sign in' }).first()

    await page.waitForLoadState('networkidle')

    const isVisible = await signInButton.isVisible({ timeout: 10000 }).catch(() => false)

    expect(isVisible).toBeTruthy()
  })
}
