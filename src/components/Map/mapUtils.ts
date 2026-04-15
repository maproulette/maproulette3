import maplibregl from 'maplibre-gl'
import { logger } from '@/lib/logger'
import type { MapBounds } from '@/types/Map'

/**
 * Valid geographic coordinate limits
 * Using slightly inside the theoretical limits to avoid strict validation errors
 */
export const MAX_LON = 180
export const MIN_LON = -180
export const MAX_LAT = 85
export const MIN_LAT = -85

/**
 * Default world bounds string
 */
export const DEFAULT_WORLD_BOUNDS = `${MIN_LON},${MIN_LAT},${MAX_LON},${MAX_LAT}`

/**
 * Check if a bounds string represents world bounds (default/no specific bounds)
 * Handles both old (-180,-90,180,90) and new format
 */
export const isWorldBounds = (boundsString: string | undefined): boolean => {
  if (!boundsString) return true
  if (boundsString === DEFAULT_WORLD_BOUNDS) return true
  if (boundsString === '-180,-90,180,90') return true

  const parts = boundsString.split(',').map(Number)
  if (parts.length !== 4 || parts.some(Number.isNaN)) return false
  const [west, south, east, north] = parts
  return west <= MIN_LON && south <= MIN_LAT && east >= MAX_LON && north >= MAX_LAT
}

/**
 * Clamp a value between min and max
 */
const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value))

/**
 * Clamp a bounds string to valid geographic ranges
 * Format: "west,south,east,north"
 * Returns clamped bounds string or the default world bounds if invalid
 */
export const clampBoundsString = (boundsString: string): string => {
  const parts = boundsString.split(',').map(Number)
  if (parts.length !== 4 || parts.some(Number.isNaN)) {
    return `${MIN_LON},${MIN_LAT},${MAX_LON},${MAX_LAT}`
  }
  return [
    clamp(parts[0], MIN_LON, MAX_LON),
    clamp(parts[1], MIN_LAT, MAX_LAT),
    clamp(parts[2], MIN_LON, MAX_LON),
    clamp(parts[3], MIN_LAT, MAX_LAT),
  ].join(',')
}

/**
 * Get the current map bounds as a comma-separated string
 * Format: "west,south,east,north"
 * Values are clamped to valid geographic ranges
 */
export const getMapBoundsString = (map: maplibregl.Map): string => {
  const bounds = map.getBounds()
  const boundsArray: MapBounds = [
    clamp(bounds.getSouthWest().lng, MIN_LON, MAX_LON),
    clamp(bounds.getSouthWest().lat, MIN_LAT, MAX_LAT),
    clamp(bounds.getNorthEast().lng, MIN_LON, MAX_LON),
    clamp(bounds.getNorthEast().lat, MIN_LAT, MAX_LAT),
  ]
  return boundsArray.join(',')
}

/**
 * Parse a bounds string into a bounds array
 * Format: "west,south,east,north" => [west, south, east, north]
 * Values are clamped to valid geographic ranges
 */
export const parseBoundsString = (boundsString: string): MapBounds | null => {
  const parts = boundsString.split(',').map(Number)
  if (parts.length !== 4 || parts.some(Number.isNaN)) {
    return null
  }

  return [
    clamp(parts[0], MIN_LON, MAX_LON),
    clamp(parts[1], MIN_LAT, MAX_LAT),
    clamp(parts[2], MIN_LON, MAX_LON),
    clamp(parts[3], MIN_LAT, MAX_LAT),
  ]
}

/**
 * Compare two bounds strings to see if they're effectively the same
 * Uses a tolerance to account for floating point precision differences
 * @param bounds1 First bounds string
 * @param bounds2 Second bounds string
 * @param tolerance Tolerance in degrees (default: 0.0001, approximately 11 meters)
 * @returns true if bounds are within tolerance
 */
export const boundsAreEqual = (
  bounds1: string,
  bounds2: string,
  tolerance: number = 0.0001
): boolean => {
  const parsed1 = parseBoundsString(bounds1)
  const parsed2 = parseBoundsString(bounds2)

  if (!parsed1 || !parsed2) {
    return bounds1 === bounds2
  }

  const [west1, south1, east1, north1] = parsed1
  const [west2, south2, east2, north2] = parsed2

  return (
    Math.abs(west1 - west2) < tolerance &&
    Math.abs(south1 - south2) < tolerance &&
    Math.abs(east1 - east2) < tolerance &&
    Math.abs(north1 - north2) < tolerance
  )
}

/**
 * Calculates bounding box from GeoJSON geometries or FeatureCollection
 * Returns [[west, south], [east, north]] or null if no valid geometries
 */
export const calculateBoundingBox = (
  geometries: GeoJSON.FeatureCollection | GeoJSON.Geometry | null
): [[number, number], [number, number]] | null => {
  if (!geometries) {
    return null
  }

  let minLng = Infinity
  let maxLng = -Infinity
  let minLat = Infinity
  let maxLat = -Infinity

  const processCoordinates = (coords: unknown): void => {
    if (Array.isArray(coords)) {
      if (coords.length >= 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
        // Point coordinates [lng, lat]
        const [lng, lat] = coords
        minLng = Math.min(minLng, lng)
        maxLng = Math.max(maxLng, lng)
        minLat = Math.min(minLat, lat)
        maxLat = Math.max(maxLat, lat)
      } else {
        // Nested array (LineString, Polygon, etc.)
        coords.forEach(processCoordinates)
      }
    }
  }

  const processGeometry = (geom: GeoJSON.Geometry): void => {
    if (geom.type === 'Point' && geom.coordinates) {
      processCoordinates(geom.coordinates)
    } else if (geom.type === 'LineString' && geom.coordinates) {
      processCoordinates(geom.coordinates)
    } else if (geom.type === 'Polygon' && geom.coordinates) {
      processCoordinates(geom.coordinates)
    } else if (geom.type === 'MultiPoint' && geom.coordinates) {
      processCoordinates(geom.coordinates)
    } else if (geom.type === 'MultiLineString' && geom.coordinates) {
      processCoordinates(geom.coordinates)
    } else if (geom.type === 'MultiPolygon' && geom.coordinates) {
      processCoordinates(geom.coordinates)
    }
  }

  // Handle FeatureCollection
  if ('features' in geometries) {
    if (!geometries.features || geometries.features.length === 0) {
      return null
    }
    geometries.features.forEach((feature) => {
      if (feature.geometry) {
        processGeometry(feature.geometry)
      }
    })
  } else {
    // Handle single geometry
    processGeometry(geometries)
  }

  if (
    !Number.isFinite(minLng) ||
    !Number.isFinite(maxLng) ||
    !Number.isFinite(minLat) ||
    !Number.isFinite(maxLat)
  ) {
    return null
  }

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ]
}

/**
 * Fit map to the given bounds
 */
export const fitMapToBounds = (
  map: maplibregl.Map,
  bounds: [[number, number], [number, number]],
  options?: {
    padding?: number | { top: number; bottom: number; left: number; right: number }
    duration?: number
  }
) => {
  // Convert array format [[west, south], [east, north]] to LngLatBounds
  const [sw, ne] = bounds
  const [west, south] = sw
  const [east, north] = ne

  // Validate bounds - check for NaN or invalid values
  if (
    !Number.isFinite(west) ||
    !Number.isFinite(south) ||
    !Number.isFinite(east) ||
    !Number.isFinite(north)
  ) {
    logger.error('Invalid bounds provided to fitMapToBounds', { bounds })
    return
  }

  // If bounds are too small (single point or very tight), expand them slightly
  // This ensures padding is applied correctly
  const lngDiff = east - west
  const latDiff = north - south
  const minDiff = 0.0001 // Minimum difference to avoid zero-width bounds

  let adjustedBounds: maplibregl.LngLatBounds
  if (Math.abs(lngDiff) < minDiff || Math.abs(latDiff) < minDiff) {
    // Single point or very small bounds - expand by minDiff
    const expandedWest = west - minDiff
    const expandedEast = east + minDiff
    const expandedSouth = south - minDiff
    const expandedNorth = north + minDiff
    adjustedBounds = new maplibregl.LngLatBounds(
      [expandedWest, expandedSouth],
      [expandedEast, expandedNorth]
    )
  } else {
    adjustedBounds = new maplibregl.LngLatBounds([west, south], [east, north])
  }

  // Normalize padding to object format if it's a number
  const padding = options?.padding ?? 0
  const paddingObj =
    typeof padding === 'number'
      ? { top: padding, right: padding, bottom: padding, left: padding }
      : padding

  const fitBoundsOptions: maplibregl.FitBoundsOptions = {
    padding: paddingObj,
    duration: 0,
  }

  map.fitBounds(adjustedBounds, fitBoundsOptions)
}

/**
 * Fly to a specific location
 */
export const flyToLocation = (
  map: maplibregl.Map,
  center: [number, number],
  zoom: number = 12,
  _duration: number = 0
) => {
  map.jumpTo({
    center,
    zoom,
  })
}

/**
 * Reset map to default view
 */
export const resetMapView = (
  map: maplibregl.Map,
  center: [number, number] = [0, 0],
  zoom: number = 2
) => {
  map.jumpTo({
    center,
    zoom,
  })
}

/**
 * Check if a layer exists on the map
 */
export const layerExists = (map: maplibregl.Map, layerId: string): boolean => {
  return !!map.getLayer(layerId)
}

/**
 * Check if a source exists on the map
 */
export const sourceExists = (map: maplibregl.Map, sourceId: string): boolean => {
  return !!map.getSource(sourceId)
}

/**
 * Safely remove a layer from the map
 */
export const removeLayer = (map: maplibregl.Map, layerId: string): void => {
  if (layerExists(map, layerId)) {
    map.removeLayer(layerId)
  }
}

/**
 * Safely remove a source from the map
 */
export const removeSource = (map: maplibregl.Map, sourceId: string): void => {
  if (sourceExists(map, sourceId)) {
    map.removeSource(sourceId)
  }
}

/**
 * Remove multiple layers from the map
 */
export const removeLayers = (map: maplibregl.Map, layerIds: string[]): void => {
  layerIds.forEach((layerId) => {
    removeLayer(map, layerId)
  })
}

/**
 * Remove multiple sources from the map
 */
export const removeSources = (map: maplibregl.Map, sourceIds: string[]): void => {
  sourceIds.forEach((sourceId) => {
    removeSource(map, sourceId)
  })
}
