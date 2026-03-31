import { useMemo } from 'react'
import type { TaskMarker } from '@/types/Task'

interface OverlapGroup {
  tasks: TaskMarker[]
}

export const useAllMarkersMap = (markers: TaskMarker[], overlaps: OverlapGroup[]) => {
  return useMemo(() => {
    const map = new Map<number, TaskMarker>()
    // Add regular markers
    markers.forEach((m) => {
      map.set(m.id, m)
    })
    // Add overlap task markers (these aren't in regular markers)
    overlaps.forEach((overlap) => {
      overlap.tasks.forEach((task) => {
        if (!map.has(task.id)) {
          map.set(task.id, task)
        }
      })
    })
    return map
  }, [markers, overlaps])
}
