import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import type { TaskMarker } from '@/types/Task'

/**
 * Find all task markers within a polygon.
 */
export const getTasksInPolygon = (markers: TaskMarker[], polygon: GeoJSON.Polygon): number[] => {
  return markers
    .filter((marker) => {
      if (!marker.location) return false
      return booleanPointInPolygon([marker.location.lng, marker.location.lat], polygon)
    })
    .map((marker) => marker.id)
}

/**
 * Get all task IDs visible in current map bounds
 */
export const getTasksInBounds = (
  markers: TaskMarker[],
  bounds: { west: number; south: number; east: number; north: number }
): number[] => {
  return markers
    .filter((marker) => {
      if (!marker.location) return false
      const { lng, lat } = marker.location
      return lng >= bounds.west && lng <= bounds.east && lat >= bounds.south && lat <= bounds.north
    })
    .map((marker) => marker.id)
}
