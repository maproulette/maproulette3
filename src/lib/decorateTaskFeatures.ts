import type { Task } from '@/types/Task'

/**
 * Decorate each feature's properties with `taskId` so map layers can style
 * features by which task they belong to.
 */
export const decorateTaskFeatures = (task: Task): GeoJSON.FeatureCollection => ({
  type: 'FeatureCollection',
  features: task.geometries.features.map((f) => ({
    ...f,
    properties: { ...f.properties, taskId: task.id },
  })),
})
