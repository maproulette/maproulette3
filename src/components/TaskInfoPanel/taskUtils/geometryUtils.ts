import bbox from '@turf/bbox'
import { logger } from '@/lib/logger'
import type { GeoJSONValue } from '@/types/geojson'
import type { Bbox2D } from '@/types/Map'
import type { Task } from '@/types/Task'

/**
 * Compute canonical [west, south, east, north] bbox for a task's geometries.
 * Returns null if the task has no usable geometries.
 */
export const calculateGeometryBounds = (task: Task): Bbox2D | null => {
  if (!task.geometries) return null

  try {
    const geometries = task.geometries as unknown as GeoJSONValue
    return bbox(geometries) as Bbox2D
  } catch (error) {
    logger.error('Failed to calculate geometry bounds', { error })
    return null
  }
}

export const parseTaskLocation = (task: Task): { lat: number; lng: number } | null => {
  if (!task.location) return null

  try {
    const location = task.location as unknown as GeoJSON.Point

    if (location.type === 'Point' && Array.isArray(location.coordinates)) {
      const [lng, lat] = location.coordinates
      if (typeof lat === 'number' && typeof lng === 'number') {
        return { lat, lng }
      }
    }
  } catch (error) {
    logger.error('Failed to parse task location', { error })
  }

  return null
}

export const parseTaskProperties = (task: Task): Record<string, unknown> | null => {
  if (!task.geometries) return null

  try {
    const geometries = task.geometries as unknown as GeoJSONValue
    if (
      geometries.type === 'FeatureCollection' &&
      geometries.features &&
      geometries.features.length > 0
    ) {
      return geometries.features[0]?.properties || null
    } else if (geometries.type === 'Feature') {
      return geometries.properties || null
    }
  } catch (error) {
    logger.error('Failed to parse task geometries', { error })
  }

  return null
}
