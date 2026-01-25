import type { TaskMarker } from '@/types/Task'

/**
 * Ray casting algorithm for point-in-polygon detection
 * Returns true if point is inside the polygon
 */
export const isPointInPolygon = (
  point: [number, number], // [lng, lat]
  polygon: [number, number][] // Array of [lng, lat] vertices
): boolean => {
  if (polygon.length < 3) return false

  const [x, y] = point
  let inside = false

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi

    if (intersect) inside = !inside
  }

  return inside
}

/**
 * Find all task markers within a polygon
 */
export const getTasksInPolygon = (markers: TaskMarker[], polygon: [number, number][]): number[] => {
  return markers
    .filter((marker) => {
      if (!marker.location) return false
      return isPointInPolygon([marker.location.lng, marker.location.lat], polygon)
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
