/**
 * Example usage of MapGrab utility
 * This file demonstrates how to use MapGrab in your Playwright tests
 */

import { expect, test } from '@playwright/test'
import { createMapGrab, MapGrab, quickGrab } from './utils/mapgrab'

// Example 1: Basic usage with createMapGrab
test('capture map state - basic', async ({ page }) => {
  await page.goto('/challenges')

  const mapGrab = createMapGrab(page)
  const result = await mapGrab.grab('my-test')

  console.log('Screenshot saved to:', result.screenshotPath)
  console.log('Map state:', result.mapState)

  expect(result.mapState.zoom).toBeGreaterThan(0)
})

// Example 2: Using quick grab for one-off captures
test('capture map state - quick grab', async ({ page }) => {
  await page.goto('/challenges')

  const result = await quickGrab(page, 'quick-capture')

  expect(result.screenshotPath).toBeTruthy()
  expect(result.mapState).toBeTruthy()
})

// Example 3: Custom options
test('capture map with custom options', async ({ page }) => {
  await page.goto('/challenges')

  const mapGrab = createMapGrab(page, {
    outputDir: './custom-captures',
    format: 'jpeg',
    quality: 80,
    prefix: 'my-map-test',
  })

  await mapGrab.grab('custom-capture')
})

// Example 4: Capturing before and after map interaction
test('capture map pan interaction', async ({ page }) => {
  await page.goto('/challenges')

  const mapGrab = createMapGrab(page)

  // Capture initial state
  const before = await mapGrab.grab('before-pan')

  // Perform interaction
  const canvas = page.locator('canvas').first()
  const box = await canvas.boundingBox()
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2)
    await page.mouse.up()
    await page.waitForTimeout(500)
  }

  // Capture after state
  const after = await mapGrab.grab('after-pan')

  // Compare states
  const comparison = MapGrab.compareStates(before.mapState, after.mapState)

  expect(comparison.centerChanged).toBe(true)
  console.log('Map moved by distance:', comparison.centerDistance)
})

// Example 5: Capturing just the map state without screenshot
test('capture only map state', async ({ page }) => {
  await page.goto('/challenges')

  const mapGrab = createMapGrab(page)
  const mapState = await mapGrab.captureMapState()

  console.log('Current zoom:', mapState.zoom)
  console.log('Current center:', mapState.center)
  console.log('Current bounds:', mapState.bounds)
})

// Example 6: Capturing markers on the map
test('capture and analyze markers', async ({ page }) => {
  await page.goto('/challenges')

  const mapGrab = createMapGrab(page)

  // Wait for map to load
  await mapGrab.waitForMapLoad()

  // Capture markers
  const markers = await mapGrab.captureMarkers()

  console.log(`Found ${markers.length} markers on the map`)

  // Take screenshot with markers visible
  await mapGrab.grab('with-markers')

  expect(markers).toBeInstanceOf(Array)
})

// Example 7: Cleanup old captures
test('cleanup old captures', async ({ page }) => {
  await page.goto('/challenges')

  const mapGrab = createMapGrab(page)

  // Take some captures
  await mapGrab.grab('test1')
  await mapGrab.grab('test2')

  // Cleanup captures older than 1 hour
  await mapGrab.cleanup(60 * 60 * 1000)
})

// Example 8: Full page screenshot
test('capture full page map screenshot', async ({ page }) => {
  await page.goto('/challenges')

  const mapGrab = createMapGrab(page, {
    fullPage: true,
  })

  const result = await mapGrab.grab('full-page')

  expect(result.screenshotPath).toContain('full-page')
})

// Example 9: Clipped/specific area screenshot
test('capture specific map area', async ({ page }) => {
  await page.goto('/challenges')

  const canvas = page.locator('canvas').first()
  const box = await canvas.boundingBox()

  if (box) {
    const mapGrab = createMapGrab(page, {
      clip: {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
      },
    })

    await mapGrab.grab('map-only')
  }
})
