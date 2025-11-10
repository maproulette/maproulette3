import type maplibregl from 'maplibre-gl'
import type { MapBounds } from '@/types/Map'

/**
 * Get the current map bounds as a comma-separated string
 * Format: "west,south,east,north"
 */
export const getMapBoundsString = (map: maplibregl.Map): string => {
  const bounds = map.getBounds()
  const boundsArray: MapBounds = [
    bounds.getSouthWest().lng, // left (west)
    bounds.getSouthWest().lat, // bottom (south)
    bounds.getNorthEast().lng, // right (east)
    bounds.getNorthEast().lat, // top (north)
  ]
  return boundsArray.join(',')
}

/**
 * Parse a bounds string into a bounds array
 * Format: "west,south,east,north" => [west, south, east, north]
 */
export const parseBoundsString = (boundsString: string): MapBounds | null => {
  const parts = boundsString.split(',').map(Number)
  if (parts.length !== 4 || parts.some(isNaN)) {
    return null
  }
  return parts as MapBounds
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
  const defaultOptions = {
    padding: 50,
    duration: 1000,
    ...options,
  }

  map.fitBounds(bounds, defaultOptions)
}

/**
 * Fly to a specific location
 */
export const flyToLocation = (
  map: maplibregl.Map,
  center: [number, number],
  zoom: number = 12,
  duration: number = 2000
) => {
  map.flyTo({
    center,
    zoom,
    duration,
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
  map.flyTo({
    center,
    zoom,
    duration: 1500,
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
  layerIds.forEach((layerId) => removeLayer(map, layerId))
}

/**
 * Remove multiple sources from the map
 */
export const removeSources = (map: maplibregl.Map, sourceIds: string[]): void => {
  sourceIds.forEach((sourceId) => removeSource(map, sourceId))
}

