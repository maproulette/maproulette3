import fs from 'node:fs'
import path from 'node:path'
import { chromium } from '@playwright/test'
import dotenv from 'dotenv'
import { startBackend } from './utils/backend.js'
import { startDatabase } from './utils/database.js'

const envPath = path.resolve(process.cwd(), '.env.test')
dotenv.config({ path: envPath })

export default async function globalSetup() {
  await startDatabase()

  await startBackend()

  await new Promise<void>((resolve) => setTimeout(resolve, 10000))

  const storageState = './playwright/.auth/state.json'
  const storageDir = path.dirname(storageState)

  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true })
  }

  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    await page.goto('http://localhost:3005', { waitUntil: 'networkidle' })

    const signInButton = page.locator('header').getByRole('button', { name: 'Sign in' })
    await signInButton.waitFor({ state: 'visible', timeout: 10000 })

    const requests: string[] = []
    page.on('request', (request) => {
      const url = request.url()
      if (url.includes('authenticate') || url.includes('auth')) {
        requests.push(url)
      }
    })

    const oauthResponsePromise = page.waitForResponse((response) => {
      const url = response.url()

      return (
        (url.includes('/auth/authenticate') || url.includes('authenticate')) &&
        response.status() === 200 &&
        response.request().method() === 'GET'
      )
    })

    const navigationPromise = page.waitForURL(/openstreetmap\.org/)

    await signInButton.waitFor({ state: 'visible', timeout: 10000 })
    const isEnabled = await signInButton.isEnabled().catch(() => false)
    if (!isEnabled) {
      console.warn('[SETUP] ⚠ Sign in button is not enabled, waiting a bit...')
      await page.waitForTimeout(2000)
    }

    await signInButton.click()

    try {
      const response = await oauthResponsePromise
      const responseData = await response.json().catch(() => null)

      if (responseData) {
        if (responseData.redirect) {
        }
      }
    } catch (_responseError) {
      console.error(`[SETUP] OAuth API response timeout. Current URL: ${page.url()}`)
      if (requests.length > 0) {
        console.error(`[SETUP] Requests made: ${requests.join(', ')}`)
      } else {
        console.error(
          `[SETUP] No OAuth requests detected - button click may not have triggered login function`
        )
      }
      await page.screenshot({ path: './playwright/.auth/oauth-response-timeout.png' })

      const bodyText = await page
        .locator('body')
        .textContent()
        .catch(() => 'Could not get body text')
      console.error(`[SETUP] Page body preview: ${bodyText?.substring(0, 500)}`)
      throw new Error(
        `Failed to get OAuth API response. Current URL: ${page.url()}. Requests made: ${requests.length}`
      )
    }

    try {
      await navigationPromise
    } catch (_navError) {
      await page.waitForTimeout(2000)
      const currentUrl = page.url()
      if (currentUrl.includes('openstreetmap.org')) {
      } else {
        console.error(`[SETUP] Navigation timeout. Current URL: ${currentUrl}`)

        await page.screenshot({ path: './playwright/.auth/navigation-timeout.png' })

        const bodyText = await page
          .locator('body')
          .textContent()
          .catch(() => 'Could not get body text')
        console.error(`[SETUP] Page body preview: ${bodyText?.substring(0, 500)}`)

        try {
          const hasErrors = await page.evaluate(() => {
            return (
              document.body.innerText.includes('error') ||
              document.body.innerText.includes('Error') ||
              document.body.innerText.includes('failed')
            )
          })
          if (hasErrors) {
            console.error(`[SETUP] Page may contain error messages`)
          }
        } catch (_e) {}
        throw new Error(`Failed to navigate to OSM login page. Current URL: ${currentUrl}`)
      }
    }

    try {
      await page.waitForSelector('#username', { timeout: 30000, state: 'visible' })
    } catch (_selectorError) {
      console.error(`[SETUP] Username field not found. Current URL: ${page.url()}`)

      await page.screenshot({ path: './playwright/.auth/username-selector-timeout.png' })
      const bodyText = await page
        .locator('body')
        .textContent()
        .catch(() => 'Could not get body text')
      console.error(`[SETUP] Page body preview: ${bodyText?.substring(0, 500)}`)
      throw new Error(`OSM login form not found. Current URL: ${page.url()}`)
    }

    await page.locator('#username').fill(process.env.REACT_APP_USERNAME || '')
    await page.locator('#password').fill(process.env.REACT_APP_PASSWORD || '')
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

    // Wait for the page to fully load and verify login state
    try {
      // Try multiple selectors that might indicate the page has loaded
      await Promise.race([
        page.waitForSelector('header', { timeout: 15000 }),
        page.waitForSelector('body', { timeout: 15000 }),
        page.waitForLoadState('domcontentloaded', { timeout: 15000 }),
      ])

      await page.waitForTimeout(2000)

      // Check if we're still on the app (not OSM or error page)
      const currentUrl = page.url()
      if (currentUrl.includes('openstreetmap.org') || currentUrl.includes('error')) {
        console.warn(`[SETUP] ⚠ Still on unexpected URL after login: ${currentUrl}`)
        await page.screenshot({ path: './playwright/.auth/unexpected-url.png' })
      } else {
        // Only check for sign in button if we're on the app
        const signInButton = await page
          .locator('header')
          .getByRole('button', { name: 'Sign in' })
          .isVisible()
          .catch(() => false)

        if (signInButton) {
          console.warn('[SETUP] ⚠ Sign in button still visible - login may have failed')
          await page.screenshot({ path: './playwright/.auth/signin-still-visible.png' })
        } else {
          console.log('[SETUP] ✓ Login verification passed - Sign in button not visible')
        }
      }
    } catch (error) {
      console.warn('[SETUP] ⚠ Warning: Could not verify login state:', error)
      // Don't fail the setup - tests can still run without verified login state
      await page.screenshot({ path: './playwright/.auth/login-verification-failed.png' })
    }

    await context.storageState({ path: storageState })
  } catch (error) {
    console.error('[SETUP] ✗ Login setup failed:', error)
    throw error
  } finally {
    await context.close()
    await browser.close()
  }
}
