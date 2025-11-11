import { chromium } from '@playwright/test'
import fs from 'fs'
import path from 'path'

async function globalSetup() {
  const storageState = './playwright/.auth/state.json'
  const storageDir = path.dirname(storageState)

  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true })
  }

  // Only run login if credentials are provided
  if (!process.env.REACT_APP_USERNAME || !process.env.REACT_APP_PASSWORD) {
    console.log('Skipping login setup - no credentials provided')
    return
  }

  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    // Navigate and sign in
    await page.goto('http://localhost:3005')
    
    // Click sign in button in header
    await page.locator('header').getByRole('button', { name: 'Sign in' }).click()

    // Wait for OSM login page
    await page.waitForLoadState('networkidle')

    // Handle OSM login
    await page.locator('#username').fill(process.env.REACT_APP_USERNAME)
    await page.locator('#password').fill(process.env.REACT_APP_PASSWORD)
    await page.locator('input[type="submit"][value="Log in"]').click()

    // Handle OAuth authorization if needed
    try {
      const authorizeButton = await page.waitForSelector(
        'input[type="submit"][value="Authorize"]',
        { timeout: 5000 }
      )
      if (authorizeButton) {
        await authorizeButton.click()
      }
    } catch (e) {
      // Authorization not needed or already granted
    }

    // Wait for redirect back to MapRoulette
    await page.waitForLoadState('networkidle')
    
    // Wait for user-specific content to confirm login
    try {
      // Look for user-specific elements that appear after login
      await page.waitForSelector('header', { timeout: 10000 })
      
      // Wait a bit more for session to be fully established
      await page.waitForTimeout(2000)
      
      // Verify we're logged in by checking if Sign in button is NOT visible
      const signInButton = await page.locator('header').getByRole('button', { name: 'Sign in' }).isVisible().catch(() => true)
      
      if (signInButton) {
        throw new Error('Login failed - Sign in button still visible after OAuth flow')
      }
      
      console.log('✓ Login verified, user session established')
    } catch (error) {
      console.error('Warning: Could not verify login state:', error)
    }

    // Save the authentication state
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

