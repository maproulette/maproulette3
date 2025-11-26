import fs from 'node:fs'
import path from 'node:path'
import { chromium } from '@playwright/test'

async function globalSetup() {
  const storageState = './playwright/.auth/state.json'
  const storageDir = path.dirname(storageState)

  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true })
  }

  if (!process.env.REACT_APP_USERNAME || !process.env.REACT_APP_PASSWORD) {
    console.log('Skipping login setup - no credentials provided')
    return
  }

  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    await page.goto('http://localhost:3005')

    await page.locator('header').getByRole('button', { name: 'Sign in' }).click()

    await page.waitForLoadState('networkidle')

    await page.locator('#username').fill(process.env.REACT_APP_USERNAME)
    await page.locator('#password').fill(process.env.REACT_APP_PASSWORD)
    await page.locator('input[type="submit"][value="Log in"]').click()

    try {
      const authorizeButton = await page.waitForSelector(
        'input[type="submit"][value="Authorize"]',
        { timeout: 5000 }
      )
      if (authorizeButton) {
        await authorizeButton.click()
      }
    } catch (_e) {}

    await page.waitForLoadState('networkidle')

    try {
      await page.waitForSelector('header', { timeout: 10000 })

      await page.waitForTimeout(2000)

      const signInButton = await page
        .locator('header')
        .getByRole('button', { name: 'Sign in' })
        .isVisible()
        .catch(() => true)

      if (signInButton) {
        throw new Error('Login failed - Sign in button still visible after OAuth flow')
      }

      console.log('✓ Login verified, user session established')
    } catch (error) {
      console.error('Warning: Could not verify login state:', error)
    }

    await context.storageState({ path: storageState })

    console.log('✓ Login setup complete, state saved to', storageState)
  } catch (error) {
    console.error('Login setup failed:', error)
    throw error
  } finally {
    await context.close()
    await browser.close()
  }
}

export default globalSetup
