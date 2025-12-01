import { expect, MapController, MapLocator } from '@mapgrab/playwright'
import { test } from '@playwright/test'

test('Water layer should display on map', async ({ page }) => {
  await page.goto('/')
  const mapController = new MapController(page, 'mainMap')

  await mapController.setView({ zoom: 5, center: [15, 38] })

  const waterLayer = new MapLocator(page, 'map[id=mainMap] layer[id=water]')
  await expect(waterLayer).toBeVisibleOnMap()
})

test('Map should zoom and pan correctly', async ({ page }) => {
  await page.goto('/')
  const mapController = new MapController(page, 'mainMap')

  await mapController.setView({ zoom: 16, center: [-0.1276, 51.5074] })

  const buildingsLayer = new MapLocator(page, 'map[id=mainMap] layer[id=building]')
  await expect(buildingsLayer).toBeVisibleOnMap()
})

test('Map controller can change view', async ({ page }) => {
  await page.goto('/')
  const mapController = new MapController(page, 'mainMap')

  await mapController.setView({ zoom: 3, center: [0, 20] })
  await mapController.setView({ zoom: 8, center: [-100, 40] })

  const waterLayer = new MapLocator(page, 'map[id=mainMap] layer[id=water]')
  await expect(waterLayer).toBeVisibleOnMap()
})
