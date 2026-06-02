/**
 * Utilities for constructing Rapid editor URLs and handling editor functionality
 */

import bbox from '@turf/bbox'
import { formatOsmEntities } from '@/components/TaskInfoPanel/taskUtils/osmUtils'
import { logger } from '@/lib/logger'
import type { Task } from '@/types/Task'

/**
 * Get OSM token from local storage
 */
export const getOSMToken = (): string | null => {
  return localStorage.getItem('osm_token') || null
}

/**
 * Extract feature properties from task geometries
 */
export const getTaskFeatureProperties = (task: Task): Record<string, unknown> | null => {
  if (!task.geometries) return null

  const { geometries } = task
  if (geometries.type === 'FeatureCollection' && geometries.features.length > 0) {
    const properties: Record<string, unknown> = {}
    for (const feature of geometries.features) {
      if (feature.properties) {
        Object.assign(properties, feature.properties)
      }
    }
    return Object.keys(properties).length > 0 ? properties : null
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
  if (task.location?.coordinates) {
    return {
      lng: task.location.coordinates[0],
      lat: task.location.coordinates[1],
    }
  }

  if (task.geometries) {
    try {
      const { geometries } = task
      if (geometries.type === 'FeatureCollection' && geometries.features.length > 0) {
        const [west, south, east, north] = bbox(geometries)
        return {
          lng: (west + east) / 2,
          lat: (south + north) / 2,
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
  mapCenter?: { lat: number; lng: number; zoom?: number },
  options: { comment?: string } = {}
): string => {
  const { comment = '' } = options
  const center = mapCenter ?? calculateTaskCenter(task)
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
