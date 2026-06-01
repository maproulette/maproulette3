import type { Task } from '@/types/Task'

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
