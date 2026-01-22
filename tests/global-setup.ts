import fs from 'node:fs'
import path from 'node:path'
import { chromium } from '@playwright/test'
import dotenv from 'dotenv'
import { startDatabase } from './utils/database.js'
import { startBackend } from './utils/backend.js'

// Load .env.test file for test environment variables
const envPath = path.resolve(process.cwd(), '.env.test')
dotenv.config({ path: envPath })

export default async function globalSetup() {
  // Immediate output to verify setup is running
  process.stdout.write('GLOBAL SETUP: Starting...\n')
  process.stdout.write('='.repeat(60) + '\n')
  process.stdout.write('GLOBAL SETUP: Starting test infrastructure\n')
  process.stdout.write('='.repeat(60) + '\n')
  console.log('='.repeat(60))
  console.log('GLOBAL SETUP: Starting test infrastructure')
  console.log('='.repeat(60))

  // Step 1: Start test database
  console.log('\n[SETUP] Step 1/5: Starting test database...')
  await startDatabase()
  console.log('[SETUP] ✓ Step 1 complete: Database started\n')

  // Step 2: Create initial database snapshot
  console.log('[SETUP] Step 2/5: Creating initial database snapshot...')

  // Step 3: Start backend server
  console.log('[SETUP] Step 3/5: Starting backend server...')
  await startBackend()
  console.log('[SETUP] ✓ Step 3 complete: Backend started\n')

  // Step 4: Wait for backend to be fully ready (evolutions applied, etc.)
  console.log('[SETUP] Step 4/5: Waiting for backend to be fully ready (evolutions, etc.)...')
  console.log('[SETUP] Waiting 10 seconds for backend to complete initialization...')
  await new Promise<void>((resolve) => setTimeout(resolve, 10000))
  console.log('[SETUP] ✓ Step 4 complete: Backend ready\n')

  // Step 5: Setup authentication (existing logic)
  console.log('[SETUP] Step 5/5: Setting up authentication...')
  const storageState = './playwright/.auth/state.json'
  const storageDir = path.dirname(storageState)

  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true })
    console.log(`[SETUP] Created auth directory: ${storageDir}`)
  }

  if (!process.env.REACT_APP_USERNAME || !process.env.REACT_APP_PASSWORD) {
    console.log('[SETUP] ⚠ Skipping login setup - no credentials provided')
    console.log('[SETUP] ✓ Step 5 skipped: Authentication setup skipped\n')
    console.log('='.repeat(60))
    console.log('GLOBAL SETUP: Complete (authentication skipped)')
    console.log('='.repeat(60))
    return
  }

  console.log('[SETUP] Credentials found, proceeding with login setup...')

  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    // Use the frontend URL (not backend)
    console.log('[SETUP] Navigating to frontend...')
    await page.goto('http://localhost:3005', { waitUntil: 'networkidle' })
    console.log(`[SETUP] Frontend loaded at: ${page.url()}`)

    console.log('[SETUP] Clicking Sign in button...')
    const signInButton = page.locator('header').getByRole('button', { name: 'Sign in' })
    await signInButton.waitFor({ state: 'visible', timeout: 10000 })
    
    // Set up promises BEFORE clicking - Playwright needs these set up before the action
    // Set up a promise to wait for the OAuth API response
    // The login function makes a GET request to /auth/authenticate
    console.log('[SETUP] Setting up OAuth API response listener...')
    
    // Also set up request interception to see what's being requested
    const requests: string[] = []
    page.on('request', (request) => {
      const url = request.url()
      if (url.includes('authenticate') || url.includes('auth')) {
        console.log(`[SETUP] Request detected: ${request.method()} ${url}`)
        requests.push(url)
      }
    })
    
    const oauthResponsePromise = page.waitForResponse(
      (response) => {
        const url = response.url()
        // Match either /auth/authenticate in the path or the full backend URL
        const matches = (url.includes('/auth/authenticate') || url.includes('authenticate')) && 
                       response.status() === 200 &&
                       response.request().method() === 'GET'
        if (matches) {
          console.log(`[SETUP] OAuth API response detected: ${url}`)
        }
        return matches
      },
      { timeout: 30000 }
    )
    
    // Also set up a promise to wait for navigation to OSM
    console.log('[SETUP] Setting up navigation listener...')
    const navigationPromise = page.waitForURL(/openstreetmap\.org/, { 
      timeout: 30000, 
      waitUntil: 'domcontentloaded' 
    })
    
    // Click the button - ensure it's enabled and visible
    console.log('[SETUP] Verifying sign in button is ready...')
    await signInButton.waitFor({ state: 'visible', timeout: 10000 })
    const isEnabled = await signInButton.isEnabled().catch(() => false)
    if (!isEnabled) {
      console.warn('[SETUP] ⚠ Sign in button is not enabled, waiting a bit...')
      await page.waitForTimeout(2000)
    }
    
    console.log('[SETUP] Clicking sign in button...')
    // Use force click if needed, but try normal click first
    try {
      await signInButton.click({ timeout: 5000 })
    } catch (clickError) {
      console.warn('[SETUP] ⚠ Normal click failed, trying force click...')
      await signInButton.click({ force: true, timeout: 5000 })
    }
    
    // Give a moment for the click to register and the async function to start
    await page.waitForTimeout(500)
    
    // Wait for the OAuth API response first
    console.log('[SETUP] Waiting for OAuth API response...')
    try {
      const response = await oauthResponsePromise
      const responseData = await response.json().catch(() => null)
      console.log(`[SETUP] ✓ OAuth API responded: ${response.url()}`)
      if (responseData) {
        console.log(`[SETUP] OAuth response contains redirect: ${!!responseData.redirect}`)
        if (responseData.redirect) {
          console.log(`[SETUP] OAuth redirect URL: ${responseData.redirect.substring(0, 100)}...`)
        }
      }
    } catch (responseError) {
      console.error(`[SETUP] OAuth API response timeout. Current URL: ${page.url()}`)
      if (requests.length > 0) {
        console.error(`[SETUP] Requests made: ${requests.join(', ')}`)
      } else {
        console.error(`[SETUP] No OAuth requests detected - button click may not have triggered login function`)
      }
      await page.screenshot({ path: './playwright/.auth/oauth-response-timeout.png' })
      // Log page content for debugging
      const bodyText = await page.locator('body').textContent().catch(() => 'Could not get body text')
      console.error(`[SETUP] Page body preview: ${bodyText?.substring(0, 500)}`)
      throw new Error(`Failed to get OAuth API response. Current URL: ${page.url()}. Requests made: ${requests.length}`)
    }
    
    // Wait for navigation to OSM login page
    console.log('[SETUP] Waiting for navigation to OSM login page...')
    try {
      await navigationPromise
      console.log(`[SETUP] ✓ Navigated to OSM domain: ${page.url()}`)
    } catch (navError) {
      // Check if we actually navigated but Playwright didn't detect it
      // Give it a moment for the navigation to complete
      await page.waitForTimeout(2000)
      const currentUrl = page.url()
      if (currentUrl.includes('openstreetmap.org')) {
        console.log(`[SETUP] ✓ Navigation detected via URL check: ${currentUrl}`)
      } else {
        console.error(`[SETUP] Navigation timeout. Current URL: ${currentUrl}`)
        // Take a screenshot for debugging
        await page.screenshot({ path: './playwright/.auth/navigation-timeout.png' })
        // Log page content for debugging
        const bodyText = await page.locator('body').textContent().catch(() => 'Could not get body text')
        console.error(`[SETUP] Page body preview: ${bodyText?.substring(0, 500)}`)
        // Check for JavaScript errors by evaluating console
        try {
          const hasErrors = await page.evaluate(() => {
            // Check if there are any visible error messages on the page
            return document.body.innerText.includes('error') || 
                   document.body.innerText.includes('Error') ||
                   document.body.innerText.includes('failed')
          })
          if (hasErrors) {
            console.error(`[SETUP] Page may contain error messages`)
          }
        } catch (e) {
          // Ignore evaluation errors
        }
        throw new Error(`Failed to navigate to OSM login page. Current URL: ${currentUrl}`)
      }
    }

    // Wait for OSM login page to load - check for username field with longer timeout
    // This will wait for navigation to OSM domain and for the form to be ready
    console.log('[SETUP] Waiting for OSM login form to load...')
    try {
      await page.waitForSelector('#username', { timeout: 30000, state: 'visible' })
      console.log(`[SETUP] OSM login page loaded at: ${page.url()}`)
    } catch (selectorError) {
      console.error(`[SETUP] Username field not found. Current URL: ${page.url()}`)
      // Take a screenshot and log page content for debugging
      await page.screenshot({ path: './playwright/.auth/username-selector-timeout.png' })
      const bodyText = await page.locator('body').textContent().catch(() => 'Could not get body text')
      console.error(`[SETUP] Page body preview: ${bodyText?.substring(0, 500)}`)
      throw new Error(`OSM login form not found. Current URL: ${page.url()}`)
    }

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

      console.log('[SETUP] ✓ Login verified, user session established')
    } catch (error) {
      console.error('[SETUP] ⚠ Warning: Could not verify login state:', error)
    }

    await context.storageState({ path: storageState })

    console.log('[SETUP] ✓ Login setup complete, state saved to', storageState)
  } catch (error) {
    console.error('[SETUP] ✗ Login setup failed:', error)
    throw error
  } finally {
    await context.close()
    await browser.close()
  }

  console.log('[SETUP] ✓ Step 5 complete: Authentication setup complete\n')
  console.log('='.repeat(60))
  console.log('GLOBAL SETUP: Complete - All systems ready for testing')
  console.log('='.repeat(60))
}
