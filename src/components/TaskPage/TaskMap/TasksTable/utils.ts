import type { Task } from '@/types/Task'

export const parseTaskLocation = (task: Task): { lat: number; lng: number } => {
  let lat = 0
  let lng = 0
  
  if (task.location) {
    try {
      const location =
        typeof task.location === 'string' ? JSON.parse(task.location) : task.location
      if (location.coordinates) {
        ;[lng, lat] = location.coordinates
      }
    } catch (_e) {
      // Ignore parsing errors
    }
  }
  
  return { lat, lng }
}

