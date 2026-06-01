import type { Task } from '@/types/Task'

/**
 * Normalize a task's geometries into a FeatureCollection. Wraps bare Geometries
 * and single Features. Each feature's properties is augmented with `taskId` so
 * layers can style features by which task they belong to.
 *
 * Returns null only if the geometries don't match any known GeoJSON shape.
 */
export const taskToFeatureCollection = (task: Task): GeoJSON.FeatureCollection | null => {
  const taskId = task.id
  const decorate = (feature: GeoJSON.Feature): GeoJSON.Feature => ({
    ...feature,
    properties: { ...feature.properties, taskId },
  })

  const { geometries } = task
  if (geometries.type === 'FeatureCollection') {
    return { type: 'FeatureCollection', features: geometries.features.map(decorate) }
  }
  if (geometries.type === 'Feature') {
    return { type: 'FeatureCollection', features: [decorate(geometries)] }
  }
  if ('coordinates' in geometries) {
    return {
      type: 'FeatureCollection',
      features: [decorate({ type: 'Feature', geometry: geometries, properties: {} })],
    }
  }
  return null
}
