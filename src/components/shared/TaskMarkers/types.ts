import type { TaskMarker } from '@/types/Task'

export interface OverlapGroup {
  id: string
  center: [number, number]
  tasks: TaskMarker[]
  radius: number
}
