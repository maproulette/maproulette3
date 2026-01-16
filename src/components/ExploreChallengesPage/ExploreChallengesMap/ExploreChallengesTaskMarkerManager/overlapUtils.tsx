import type { TaskMarker } from '@/types/Task'
import { OVERLAP_CONFIG } from './const'
import type { OverlapGroup } from './types'

/**
 * Calculate distance between two coordinates in degrees
 */
const calculateDistance = (coord1: [number, number], coord2: [number, number]): number => {
  const [lng1, lat1] = coord1
  const [lng2, lat2] = coord2
  return Math.sqrt((lng2 - lng1) ** 2 + (lat2 - lat1) ** 2)
}

/**
 * Calculate the center point of a group of coordinates
 */
const calculateCenter = (coordinates: [number, number][]): [number, number] => {
  const totalLng = coordinates.reduce((sum, [lng]) => sum + lng, 0)
  const totalLat = coordinates.reduce((sum, [, lat]) => sum + lat, 0)
  return [totalLng / coordinates.length, totalLat / coordinates.length]
}

/**
 * Calculate appropriate radius for overlap visualization based on task count
 */
const calculateOverlapRadius = (taskCount: number): number => {
  const { minOverlapRadius, maxOverlapRadius } = OVERLAP_CONFIG
  const normalizedCount = Math.min(taskCount / 10, 1) // Normalize to 0-1 based on max 10 tasks
  return minOverlapRadius + (maxOverlapRadius - minOverlapRadius) * normalizedCount
}

/**
 * Detect overlapping tasks and group them
 */
export const detectOverlappingTasks = (
  tasks: TaskMarker[]
): {
  overlaps: OverlapGroup[]
  nonOverlapping: TaskMarker[]
} => {
  const processed = new Set<string>()
  const overlaps: OverlapGroup[] = []
  const nonOverlapping: TaskMarker[] = []

  tasks.forEach((task, index) => {
    if (processed.has(task.id.toString())) return

    const taskCoord: [number, number] = [task.location.lng, task.location.lat]
    const nearbyTasks: TaskMarker[] = [task]

    // Find all tasks within overlap threshold
    tasks.slice(index + 1).forEach((otherTask) => {
      if (processed.has(otherTask.id.toString())) return

      const otherCoord: [number, number] = [otherTask.location.lng, otherTask.location.lat]
      const distance = calculateDistance(taskCoord, otherCoord)

      if (distance <= OVERLAP_CONFIG.threshold) {
        nearbyTasks.push(otherTask)
        processed.add(otherTask.id.toString())
      }
    })

    processed.add(task.id.toString())

    if (nearbyTasks.length > 1) {
      // Create overlap group
      const coordinates = nearbyTasks.map(
        (t) => [t.location.lng, t.location.lat] as [number, number]
      )
      const center = calculateCenter(coordinates)
      const radius = calculateOverlapRadius(nearbyTasks.length)

      overlaps.push({
        id: `overlap-${nearbyTasks.map((t) => t.id).join('-')}`,
        center,
        tasks: nearbyTasks,
        radius,
      })
    } else {
      // Single task, no overlap
      nonOverlapping.push(task)
    }
  })

  return { overlaps, nonOverlapping }
}
