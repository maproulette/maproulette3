import { test } from '@playwright/test';
import { MapLocator, MapController, expect } from '@mapgrab/playwright';

test('Water layer should display on map', async ({ page }) => {
    await page.goto('/challenges');
    const mapController = new MapController(page, 'mainMap');
    
    // Set view to show a large body of water (Mediterranean Sea)
    await mapController.setView({ zoom: 5, center: [15, 38] });
    
    // Check that the water layer is visible
    const waterLayer = new MapLocator(page, 'map[id=mainMap] layer[id=water]');
    await expect(waterLayer).toBeVisibleOnMap();
});

test('Map should zoom and pan correctly', async ({ page }) => {
    await page.goto('/challenges');
    const mapController = new MapController(page, 'mainMap');
    
    // Zoom in to a specific location (London) - buildings appear at zoom 16+
    await mapController.setView({ zoom: 16, center: [-0.1276, 51.5074] });
    
    // Check that buildings layer becomes visible at high zoom
    const buildingsLayer = new MapLocator(page, 'map[id=mainMap] layer[id=building]');
    await expect(buildingsLayer).toBeVisibleOnMap();
});

test('Map controller can change view', async ({ page }) => {
    await page.goto('/challenges');
    const mapController = new MapController(page, 'mainMap');
    
    // Test that we can set different views
    await mapController.setView({ zoom: 3, center: [0, 20] });
    await mapController.setView({ zoom: 8, center: [-100, 40] });
    
    // Verify water is visible at this location (North America coast)
    const waterLayer = new MapLocator(page, 'map[id=mainMap] layer[id=water]');
    await expect(waterLayer).toBeVisibleOnMap();
});