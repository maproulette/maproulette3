import fs from 'node:fs'
import path from 'node:path'
import { chromium } from '@playwright/test'
import dotenv from 'dotenv'
import { startBackend } from './utils/backend.js'
import { startDatabase } from './utils/database.js'

const envPath = path.resolve(process.cwd(), '.env.test')
dotenv.config({ path: envPath })

const FRONTEND_URL = 'http://localhost:3005'

/**
 * Wait for the frontend server to be ready by checking if it responds
 */
async function waitForFrontend(maxRetries?: number): Promise<void> {
  const defaultRetries = process.env.CI ? 90 : 30
  const retries = maxRetries ?? defaultRetries

  const http = await import('node:http')
  const url = new URL(FRONTEND_URL)
  const port = url.port ? parseInt(url.port, 10) : url.protocol === 'https:' ? 443 : 80

  for (let i = 0; i < retries; i++) {
    const attempt = i + 1
    if (attempt % 10 === 0 || attempt === 1) {
      console.log(`[FRONTEND] Waiting for frontend server... (attempt ${attempt}/${retries})`)
    }

    try {
      await new Promise<void>((resolve, reject) => {
        const req = http.get(
          {
            hostname: url.hostname,
            port: port,
            path: '/',
            timeout: 5000,
          },
          (res) => {
            res.resume()

            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 400) {
              resolve()
            } else {
              reject(new Error(`Status: ${res.statusCode}`))
            }
          }
        )
        req.on('error', (err) => {
          if (attempt % 10 === 0) {
          }
          reject(err)
        })
        req.on('timeout', () => {
          req.destroy()
          reject(new Error('Request timeout'))
        })
      })

      console.log(`[FRONTEND] ✓ Frontend server is ready`)
      return
    } catch (error: unknown) {
      if (attempt === retries) {
        console.error(`[FRONTEND] ✗ All ${retries} attempts failed. Last error:`, error)
        const message = error instanceof Error ? error.message : String(error)
        throw new Error(
          `Frontend did not become ready within ${retries * 2} seconds. Last error: ${message}`
        )
      }
    }

    await new Promise<void>((resolve) => setTimeout(resolve, 2000))
  }

  throw new Error(`Frontend did not become ready within ${retries * 2} seconds`)
}

export default async function globalSetup() {
  await startDatabase()

  await startBackend()

  console.log('[SETUP] Waiting for frontend server to be ready...')
  await waitForFrontend()

  const storageState = './playwright/.auth/state.json'
  const storageDir = path.dirname(storageState)

  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true })
  }

  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    await page.goto(FRONTEND_URL, { waitUntil: 'domcontentloaded', timeout: 30000 })

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
        } catch (error) {
          console.warn('[SETUP] Could not check for errors on page:', error)
        }
        throw new Error(`Failed to navigate to OSM login page. Current URL: ${currentUrl}`)
      }
    }

    try {
      await page.waitForSelector('#username', { timeout: 30000, state: 'visible' })
    } catch (_selectorError) {
      console.error(`[SETUP] Username field not found. Current URL: ${page.url()}`)

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
    } catch (_error) {
      console.log('[SETUP] No authorize button found (may already be authorized)')
    }

    await page.waitForLoadState('networkidle')

    try {
      await Promise.race([
        page.waitForSelector('header', { timeout: 15000 }),
        page.waitForSelector('body', { timeout: 15000 }),
        page.waitForLoadState('domcontentloaded', { timeout: 15000 }),
      ])

      await page.waitForTimeout(2000)

      const currentUrl = page.url()
      if (currentUrl.includes('openstreetmap.org') || currentUrl.includes('error')) {
        console.warn(`[SETUP] ⚠ Still on unexpected URL after login: ${currentUrl}`)
      } else {
        const signInButton = await page
          .locator('header')
          .getByRole('button', { name: 'Sign in' })
          .isVisible()
          .catch(() => false)

        if (signInButton) {
          console.warn('[SETUP] ⚠ Sign in button still visible - login may have failed')
        } else {
          console.log('[SETUP] ✓ Login verification passed - Sign in button not visible')
        }
      }
    } catch (error) {
      console.warn('[SETUP] ⚠ Warning: Could not verify login state:', error)
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
