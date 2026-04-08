import { logger } from '@/lib/logger'
import type { Task } from '@/types/Task'

export const calculateGeometryBounds = (
  task: Task
): [[number, number], [number, number]] | null => {
  if (!task.geometries) return null

  try {
    const geometries =
      typeof task.geometries === 'string' ? JSON.parse(task.geometries) : task.geometries

    let minLng = Infinity
    let maxLng = -Infinity
    let minLat = Infinity
    let maxLat = -Infinity

    const processCoordinates = (coords: unknown): void => {
      if (Array.isArray(coords)) {
        if (coords.length >= 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
          const [lng, lat] = coords
          if (Number.isFinite(lng) && Number.isFinite(lat)) {
            minLng = Math.min(minLng, lng)
            maxLng = Math.max(maxLng, lng)
            minLat = Math.min(minLat, lat)
            maxLat = Math.max(maxLat, lat)
          }
        } else {
          coords.forEach(processCoordinates)
        }
      }
    }

    const processGeometry = (geom: { type: string; coordinates?: unknown }) => {
      if (geom.coordinates) {
        processCoordinates(geom.coordinates)
      }
    }

    if (geometries.type === 'FeatureCollection' && geometries.features) {
      geometries.features.forEach(
        (feature: { geometry?: { type: string; coordinates?: unknown } }) => {
          if (feature.geometry) {
            processGeometry(feature.geometry)
          }
        }
      )
    } else if (geometries.type === 'Feature' && geometries.geometry) {
      processGeometry(geometries.geometry)
    } else if (geometries.coordinates) {
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
  } catch (error) {
    logger.error('Failed to calculate geometry bounds', { error })
    return null
  }
}

export const parseTaskLocation = (task: Task): { lat: number; lng: number } | null => {
  if (!task.location) return null

  try {
    const location = typeof task.location === 'string' ? JSON.parse(task.location) : task.location

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
    const geometries =
      typeof task.geometries === 'string' ? JSON.parse(task.geometries) : task.geometries

    if (geometries.type === 'FeatureCollection' && geometries.features?.length > 0) {
      return geometries.features[0]?.properties || null
    } else if (geometries.type === 'Feature') {
      return geometries.properties || null
    }
  } catch (error) {
    logger.error('Failed to parse task geometries', { error })
  }

  return null
}
