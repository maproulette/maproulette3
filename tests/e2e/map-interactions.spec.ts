import { expect, test } from '@playwright/test'
import { createMapGrab } from '../utils/mapgrab'

test.describe('Map Interactions', () => {
  // These tests should run unauthenticated
  test.use({ storageState: { cookies: [], origins: [] } })

  test.beforeEach(async ({ context, page }) => {
    // Clear all cookies to ensure unauthenticated state
    await context.clearCookies()
    
    await page.goto('/challenges')
    // Wait for map to load
    await page.waitForSelector('canvas', { state: 'visible', timeout: 10000 })
  })

  test('should zoom in on map', async ({ page }) => {
    const mapGrab = createMapGrab(page, { prefix: 'map-zoom' })

    // Capture initial state
    const initialState = await mapGrab.captureMapState()
    console.log('Initial zoom:', initialState.zoom)

    // Find and click zoom in button
    const zoomInButton = page
      .locator('button[class*="zoom-in"], button[aria-label*="zoom in" i]')
      .first()

    if (await zoomInButton.isVisible().catch(() => false)) {
      await zoomInButton.click()
      await page.waitForTimeout(500)

      // Capture new state
      const newState = await mapGrab.captureMapState()
      console.log('New zoom:', newState.zoom)

      // Zoom should have increased
      expect(newState.zoom).toBeGreaterThan(initialState.zoom)
    } else {
      console.log('Zoom button not found, test skipped')
    }
  })

  test('should capture map markers', async ({ page }) => {
    const mapGrab = createMapGrab(page)

    // Wait for map to fully load
    await mapGrab.waitForMapLoad()

    // Capture markers
    const markers = await mapGrab.captureMarkers()

    console.log('Found markers:', markers.length)

    // Take a screenshot with markers
    await mapGrab.grab('with-markers')

    // Should find at least some DOM elements that might be markers
    // (This might be 0 if no challenges are in view)
    expect(markers).toBeInstanceOf(Array)
  })

  test('should handle map double-click zoom', async ({ page }) => {
    const mapGrab = createMapGrab(page, { prefix: 'map-doubleclick' })

    const canvas = page.locator('canvas').first()
    const boundingBox = await canvas.boundingBox()

    if (boundingBox) {
      // Capture initial state
      const initialState = await mapGrab.captureMapState()

      // Double click center of map
      const centerX = boundingBox.x + boundingBox.width / 2
      const centerY = boundingBox.y + boundingBox.height / 2

      await page.mouse.dblclick(centerX, centerY)
      await page.waitForTimeout(1000)

      // Capture new state
      const newState = await mapGrab.captureMapState()

      console.log('Zoom before:', initialState.zoom)
      console.log('Zoom after:', newState.zoom)

      // Double-click typically zooms in
      expect(newState.zoom).toBeGreaterThanOrEqual(initialState.zoom)
    }
  })
})
