import bbox from '@turf/bbox'
import { logger } from '@/lib/logger'
import type { Bbox2D } from '@/types/Map'
import type { Task } from '@/types/Task'

/**
 * Compute canonical [west, south, east, north] bbox for a task's geometries.
 * Returns null if the task has no usable geometries.
 */
export const calculateGeometryBounds = (task: Task): Bbox2D | null => {
  if (!task.geometries) return null

  try {
    return bbox(task.geometries) as Bbox2D
  } catch (error) {
    logger.error('Failed to calculate geometry bounds', { error })
    return null
  }
}

export const parseTaskLocation = (task: Task): { lat: number; lng: number } | null => {
  if (!task.location) return null

  const { coordinates } = task.location
  if (Array.isArray(coordinates)) {
    const [lng, lat] = coordinates
    if (typeof lat === 'number' && typeof lng === 'number') {
      return { lat, lng }
    }
  }

  return null
}

export const parseTaskProperties = (task: Task): Record<string, unknown> | null => {
  if (!task.geometries) return null

  if (
    task.geometries.type === 'FeatureCollection' &&
    task.geometries.features &&
    task.geometries.features.length > 0
  ) {
    return task.geometries.features[0]?.properties || null
  }
  if (task.geometries.type === 'Feature') {
    return task.geometries.properties || null
  }

  return null
}
