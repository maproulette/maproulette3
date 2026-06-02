import type { Task } from '@/types/Task'

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
