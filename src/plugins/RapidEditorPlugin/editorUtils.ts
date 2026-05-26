/**
 * Utilities for constructing Rapid editor URLs and handling editor functionality
 */

import { formatOsmEntities } from '@/components/TaskInfoPanel/taskUtils/osmUtils'
import { logger } from '@/lib/logger'
import type { Task } from '@/types/Task'

/**
 * Get OSM token from local storage
 */
export const getOSMToken = (): string | null => {
  return localStorage.getItem('osm_token') || null
}

export interface MapBounds {
  bounds: {
    north: number
    south: number
    east: number
    west: number
  }
  zoom?: number
}

interface GeoJSONFeature {
  properties?: Record<string, unknown>
  geometry?: {
    coordinates: number[] | number[][] | number[][][]
    type: string
  }
}

interface GeoJSONFeatureCollection {
  features?: GeoJSONFeature[]
}

/**
 * Extract feature properties from task geometries
 */
export const getTaskFeatureProperties = (task: Task): Record<string, unknown> | null => {
  if (!task.geometries) return null

  try {
    const geometries: GeoJSONFeatureCollection =
      typeof task.geometries === 'string' ? JSON.parse(task.geometries) : task.geometries

    if (geometries.features && geometries.features.length > 0) {
      const properties: Record<string, unknown> = {}
      for (const feature of geometries.features) {
        if (feature.properties) {
          Object.assign(properties, feature.properties)
        }
      }
      return Object.keys(properties).length > 0 ? properties : null
    }
  } catch (error) {
    logger.error('Failed to parse task geometries', { error })
  }

  return null
}

/**
 * Replace property tags in comment with actual values
 */
export const replacePropertyTags = (
  comment: string,
  properties: Record<string, unknown>,
  encode = false
): string => {
  let replacedComment = comment

  Object.keys(properties).forEach((key) => {
    const pattern = new RegExp(`{{${key}}}`, 'g')
    const value = encode ? encodeURIComponent(String(properties[key])) : String(properties[key])
    replacedComment = replacedComment.replace(pattern, value)
  })

  return replacedComment
}

/**
 * Calculate center point from task location or geometries
 */
export const calculateTaskCenter = (task: Task): { lat: number; lng: number; zoom?: number } => {
  if (task.location) {
    try {
      const location = typeof task.location === 'string' ? JSON.parse(task.location) : task.location

      if (location.coordinates) {
        return {
          lng: location.coordinates[0],
          lat: location.coordinates[1],
        }
      }
    } catch (error) {
      logger.error('Failed to parse task location', { error })
    }
  }

  if (task.geometries) {
    try {
      const geometries =
        typeof task.geometries === 'string' ? JSON.parse(task.geometries) : task.geometries

      if (geometries.features && geometries.features.length > 0) {
        let minLng = Infinity
        let maxLng = -Infinity
        let minLat = Infinity
        let maxLat = -Infinity

        for (const feature of geometries.features as GeoJSONFeature[]) {
          if (feature.geometry) {
            const processCoords = (coords: number[] | number[][] | number[][][]): void => {
              if (Array.isArray(coords[0])) {
                for (const coord of coords as (number[] | number[][])[]) {
                  processCoords(coord)
                }
              } else {
                const [lng, lat] = coords as number[]
                minLng = Math.min(minLng, lng)
                maxLng = Math.max(maxLng, lng)
                minLat = Math.min(minLat, lat)
                maxLat = Math.max(maxLat, lat)
              }
            }

            processCoords(feature.geometry.coordinates)
          }
        }

        if (minLng !== Infinity) {
          return {
            lng: (minLng + maxLng) / 2,
            lat: (minLat + maxLat) / 2,
          }
        }
      }
    } catch (error) {
      logger.error('Failed to calculate center from geometries', { error })
    }
  }

  return { lng: 0, lat: 0, zoom: 2 }
}

/**
 * Construct Rapid editor URI with task context
 */
export const constructRapidURI = (
  task: Task,
  mapBounds?: MapBounds | { lat: number; lng: number; zoom?: number },
  options: { comment?: string } = {}
): string => {
  const { comment = '' } = options

  let center: { lat: number; lng: number; zoom?: number }

  if (mapBounds) {
    if ('bounds' in mapBounds) {
      center = {
        lng: (mapBounds.bounds.east + mapBounds.bounds.west) / 2,
        lat: (mapBounds.bounds.north + mapBounds.bounds.south) / 2,
        zoom: mapBounds.zoom,
      }
    } else {
      center = mapBounds
    }
  } else {
    center = calculateTaskCenter(task)
  }

  const zoom = center.zoom || 18

  let processedComment = comment
  const properties = getTaskFeatureProperties(task)
  if (properties) {
    processedComment = replacePropertyTags(comment, properties, true)
  }

  // Build hash manually: URLSearchParams percent-encodes the slashes in
  // `map=zoom/lat/lng`, which Rapid can't parse.
  const parts = [`map=${zoom}/${center.lat}/${center.lng}`]

  const selection = formatOsmEntities(task, { abbreviated: true })
  if (selection) {
    parts.push(`id=${selection}`)
  }

  if (processedComment) {
    parts.push(`comment=${encodeURIComponent(processedComment)}`)
  }

  if (task.id) {
    parts.push(`maproulette_task=${task.id}`)
  }

  if (task.parent) {
    parts.push(`maproulette_challenge=${task.parent}`)
  }

  return `#${parts.join('&')}`
}
