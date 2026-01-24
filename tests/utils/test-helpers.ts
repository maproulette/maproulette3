import type { Page } from '@playwright/test'

/**
 * Common test helper functions for MapRoulette tests
 */

/**
 * Wait for the application to be fully loaded
 */
export async function waitForAppReady(page: Page, timeout = 10000): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout })
  await page.waitForSelector('#root, main, [role="main"]', {
    state: 'visible',
    timeout,
  })
}

/**
 * Mock API responses for testing
 */
export async function mockApiResponse(
  page: Page,
  endpoint: string,
  response: unknown,
  status = 200
): Promise<void> {
  await page.route(endpoint, (route) => {
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(response),
    })
  })
}

/**
 * Wait for map to be loaded and interactive
 */
export async function waitForMap(page: Page, timeout = 15000): Promise<void> {
  await page.waitForSelector('canvas', { state: 'visible', timeout })

  await page.waitForTimeout(1000)

  await page
    .waitForFunction(
      () => {
        const map = (window as unknown as { mapInstance?: { isMoving?: () => boolean } })
          .mapInstance
        return !map || !map.isMoving || !map.isMoving()
      },
      { timeout }
    )
    .catch(() => {
      console.warn('Map might still be loading, continuing anyway')
    })
}

/**
 * Get current route/path from TanStack Router
 */
export async function getCurrentRoute(page: Page): Promise<string> {
  return await page.evaluate(() => window.location.pathname)
}

/**
 * Login helper (for future authenticated tests)
 */
export async function loginWithApiKey(page: Page, apiKey: string): Promise<void> {
  await page.evaluate((key) => {
    localStorage.setItem('maproulette_api_key', key)
  }, apiKey)
}

/**
 * Check if element is in viewport
 */
export async function isInViewport(page: Page, selector: string): Promise<boolean> {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel)
    if (!element) return false

    const rect = element.getBoundingClientRect()
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  }, selector)
}

/**
 * Scroll element into view smoothly
 */
export async function scrollIntoView(page: Page, selector: string): Promise<void> {
  await page.evaluate((sel) => {
    const element = document.querySelector(sel)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, selector)
  await page.waitForTimeout(500)
}

/**
 * Get console logs from the page
 */
export function setupConsoleCapture(page: Page): string[] {
  const logs: string[] = []

  page.on('console', (msg) => {
    logs.push(`${msg.type()}: ${msg.text()}`)
  })

  page.on('pageerror', (error) => {
    logs.push(`ERROR: ${error.message}`)
  })

  return logs
}

/**
 * Wait for network to be idle with specific number of connections
 */
export async function waitForNetworkIdle(
  page: Page,
  _maxConnections = 0,
  timeout = 5000
): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout })
}

/**
 * Get element text content safely
 */
export async function getTextContent(page: Page, selector: string): Promise<string | null> {
  try {
    return await page.textContent(selector, { timeout: 5000 })
  } catch {
    return null
  }
}

/**
 * Check if page has errors
 */
export async function hasPageErrors(page: Page): Promise<boolean> {
  const errors = await page.evaluate(() => {
    return !!(window as unknown as { __hasRuntimeErrors?: boolean }).__hasRuntimeErrors
  })
  return errors
}
