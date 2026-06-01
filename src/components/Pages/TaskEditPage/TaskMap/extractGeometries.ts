import { logger } from '@/lib/logger'
import type { Task } from '@/types/Task'

export const extractGeometries = (task: Task | null): GeoJSON.FeatureCollection | null => {
  if (!task?.geometries) return null

  try {
    const { geometries } = task
    if (geometries.type === 'FeatureCollection') {
      return geometries
    }

    if (geometries.type === 'Feature') {
      return {
        type: 'FeatureCollection',
        features: [geometries],
      }
    }

    if ('coordinates' in geometries) {
      return {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: geometries,
            properties: {},
          },
        ],
      }
    }

    return null
  } catch (error) {
    logger.error('Failed to parse task geometries', { error: String(error) })
    return null
  }
}
