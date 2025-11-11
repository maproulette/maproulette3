import * as fs from 'node:fs'
import * as path from 'node:path'
import type { Page } from '@playwright/test'

/**
 * MapGrab - Utility for capturing map screenshots and data during testing
 * This tool helps capture map states, screenshots, and extract geographic data
 * from MapRoulette's map interface for testing and debugging purposes.
 */

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export interface MapGrabOptions {
  /** Output directory for captured files */
  outputDir?: string
  /** Screenshot format */
  format?: 'png' | 'jpeg'
  /** Screenshot quality (0-100) for jpeg */
  quality?: number
  /** Include full page screenshot */
  fullPage?: boolean
  /** Custom viewport for screenshot */
  clip?: BoundingBox
  /** Prefix for output files */
  prefix?: string
}

export interface MapState {
  /** Current map center coordinates [lng, lat] */
  center: [number, number]
  /** Current zoom level */
  zoom: number
  /** Current bounds [[minLng, minLat], [maxLng, maxLat]] */
  bounds: [[number, number], [number, number]]
  /** Current bearing (rotation) */
  bearing?: number
  /** Current pitch (tilt) */
  pitch?: number
  /** Timestamp of capture */
  timestamp: string
}

export interface MapGrabResult {
  /** Path to saved screenshot */
  screenshotPath: string
  /** Captured map state */
  mapState: MapState
  /** Path to saved map state JSON */
  statePath: string
}

/**
 * MapGrab class for capturing map data during Playwright tests
 */
export class MapGrab {
  private page: Page
  private options: Required<MapGrabOptions>
  private captureCount: number = 0

  constructor(page: Page, options: MapGrabOptions = {}) {
    this.page = page
    this.options = {
      outputDir: options.outputDir || './test-results/mapgrab',
      format: options.format || 'png',
      quality: options.quality || 90,
      fullPage: options.fullPage ?? false,
      // biome-ignore lint/suspicious/noExplicitAny: BoundingBox or undefined
      clip: options.clip || (undefined as any),
      prefix: options.prefix || 'capture',
    }

    // Ensure output directory exists
    if (!fs.existsSync(this.options.outputDir)) {
      fs.mkdirSync(this.options.outputDir, { recursive: true })
    }
  }

  /**
   * Capture the current map state including coordinates, zoom, and bounds
   */
  async captureMapState(): Promise<MapState> {
    const mapState = await this.page.evaluate(() => {
      // For MapLibre GL JS
      // biome-ignore lint/suspicious/noExplicitAny: Dynamic map instance access
      if ((window as any).mapInstance) {
        // biome-ignore lint/suspicious/noExplicitAny: Dynamic map instance access
        const map = (window as any).mapInstance
        const center = map.getCenter()
        const bounds = map.getBounds()

        return {
          center: [center.lng, center.lat] as [number, number],
          zoom: map.getZoom(),
          bounds: [
            [bounds.getWest(), bounds.getSouth()],
            [bounds.getEast(), bounds.getNorth()],
          ] as [[number, number], [number, number]],
          bearing: map.getBearing(),
          pitch: map.getPitch(),
          timestamp: new Date().toISOString(),
        }
      }

      // Fallback if map instance is not directly accessible
      return {
        center: [0, 0] as [number, number],
        zoom: 0,
        bounds: [
          [0, 0],
          [0, 0],
        ] as [[number, number], [number, number]],
        bearing: 0,
        pitch: 0,
        timestamp: new Date().toISOString(),
      }
    })

    return mapState as MapState
  }

  /**
   * Capture a screenshot of the map
   */
  async captureScreenshot(name?: string): Promise<string> {
    const timestamp = Date.now()
    const filename = name
      ? `${this.options.prefix}_${name}_${timestamp}.${this.options.format}`
      : `${this.options.prefix}_${this.captureCount++}_${timestamp}.${this.options.format}`

    const screenshotPath = path.join(this.options.outputDir, filename)

    await this.page.screenshot({
      path: screenshotPath,
      type: this.options.format,
      quality: this.options.format === 'jpeg' ? this.options.quality : undefined,
      fullPage: this.options.fullPage,
      clip: this.options.clip,
    })

    return screenshotPath
  }

  /**
   * Capture both screenshot and map state
   */
  async grab(name?: string): Promise<MapGrabResult> {
    // Wait for map to be loaded
    await this.waitForMapLoad()

    const mapState = await this.captureMapState()
    const screenshotPath = await this.captureScreenshot(name)

    // Save map state as JSON
    const timestamp = Date.now()
    const stateFilename = name
      ? `${this.options.prefix}_${name}_${timestamp}_state.json`
      : `${this.options.prefix}_${this.captureCount}_${timestamp}_state.json`

    const statePath = path.join(this.options.outputDir, stateFilename)
    fs.writeFileSync(statePath, JSON.stringify(mapState, null, 2))

    return {
      screenshotPath,
      mapState,
      statePath,
    }
  }

  /**
   * Wait for the map to finish loading
   */
  async waitForMapLoad(timeout: number = 10000): Promise<void> {
    try {
      // Wait for the map container to be visible
      await this.page.waitForSelector('canvas', {
        state: 'visible',
        timeout,
      })

      // Wait a bit for tiles to load
      await this.page.waitForTimeout(1000)

      // Check if map is idle
      await this.page.waitForFunction(
        () => {
          // biome-ignore lint/suspicious/noExplicitAny: Dynamic map instance access
          const map = (window as any).mapInstance
          if (map && typeof map.isMoving === 'function') {
            return !map.isMoving()
          }
          return true
        },
        { timeout }
      )
    } catch {
      console.warn('Map load timeout or not found, continuing anyway')
    }
  }

  /**
   * Capture markers visible on the map
   */
  async captureMarkers(): Promise<
    Array<{
      position: { x: number; y: number; width: number; height: number }
      dataset: DOMStringMap
      className: string
    }>
  > {
    const markers = await this.page.evaluate(() => {
      const markerElements = document.querySelectorAll('[class*="marker"]')
      return Array.from(markerElements).map((marker) => {
        const rect = marker.getBoundingClientRect()
        return {
          position: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          },
          dataset: (marker as HTMLElement).dataset,
          className: marker.className,
        }
      })
    })

    return markers
  }

  /**
   * Compare two map states
   */
  static compareStates(
    state1: MapState,
    state2: MapState
  ): {
    centerChanged: boolean
    zoomChanged: boolean
    centerDistance: number
  } {
    const centerDistance = Math.sqrt(
      (state1.center[0] - state2.center[0]) ** 2 + (state1.center[1] - state2.center[1]) ** 2
    )

    return {
      centerChanged: centerDistance > 0.0001,
      zoomChanged: state1.zoom !== state2.zoom,
      centerDistance,
    }
  }

  /**
   * Clean up old captures
   */
  async cleanup(olderThanMs?: number): Promise<void> {
    const files = fs.readdirSync(this.options.outputDir)
    const now = Date.now()

    for (const file of files) {
      if (!file.startsWith(this.options.prefix)) continue

      const filePath = path.join(this.options.outputDir, file)
      const stats = fs.statSync(filePath)

      if (olderThanMs && now - stats.mtimeMs > olderThanMs) {
        fs.unlinkSync(filePath)
      }
    }
  }
}

/**
 * Helper function to create a MapGrab instance
 */
export function createMapGrab(page: Page, options?: MapGrabOptions): MapGrab {
  return new MapGrab(page, options)
}

/**
 * Quick grab function for simple use cases
 */
export async function quickGrab(
  page: Page,
  name: string,
  options?: MapGrabOptions
): Promise<MapGrabResult> {
  const mapGrab = new MapGrab(page, options)
  return await mapGrab.grab(name)
}
