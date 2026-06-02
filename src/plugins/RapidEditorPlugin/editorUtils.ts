/**
 * Utilities for constructing Rapid editor URLs and handling editor functionality
 */

import { formatOsmEntities } from '@/components/TaskInfoPanel/taskUtils/osmUtils'
import type { Task } from '@/types/Task'

/**
 * Get OSM token from local storage
 */
export const getOSMToken = (): string | null => {
  return localStorage.getItem('osm_token') || null
}

/**
 * Extract feature properties from task geometries, merging across features
 * (later keys win). Used for `{{key}}` substitution in checkin comments.
 */
export const getTaskFeatureProperties = (task: Task): Record<string, unknown> | null => {
  const properties: Record<string, unknown> = {}
  for (const feature of task.geometries.features) {
    if (feature.properties) {
      Object.assign(properties, feature.properties)
    }
  }
  return Object.keys(properties).length > 0 ? properties : null
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
 * Construct Rapid editor URI with task context
 */
export const constructRapidURI = (
  task: Task,
  mapCenter?: { lat: number; lng: number; zoom?: number },
  options: { comment?: string } = {}
): string => {
  const { comment = '' } = options
  const [taskLng, taskLat] = task.location.coordinates
  const center = mapCenter ?? { lng: taskLng, lat: taskLat }
  const zoom = center.zoom ?? 18

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
