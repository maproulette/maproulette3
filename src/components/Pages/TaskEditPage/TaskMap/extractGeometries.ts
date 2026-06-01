import { logger } from '@/lib/logger'

import type { GeoJSONValue } from '@/types/geojson'
export const extractGeometries = (
  task: { geometries?: string | unknown } | null
): GeoJSON.FeatureCollection | null => {
  if (!task?.geometries) return null

  try {
    const geometries = task.geometries as unknown as GeoJSONValue
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
