import type { Task } from '@/types/Task'

export const parseTaskProperties = (task: Task): Record<string, unknown> | null => {
  return task.geometries.features[0]?.properties ?? null
}
