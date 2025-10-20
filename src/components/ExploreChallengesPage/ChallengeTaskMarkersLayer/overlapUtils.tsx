import type { TaskMarker } from '@/types/Task'
import { OVERLAP_CONFIG } from './const'

export interface OverlapGroup {
  id: string
  center: [number, number]
  tasks: TaskMarker[]
  radius: number
  hasMultipleStatuses: boolean
  dominantStatus: number
}

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
 * Find the most common status in a group of tasks
 */
const getDominantStatus = (tasks: TaskMarker[]): number => {
  const statusCounts = tasks.reduce(
    (counts, task) => {
      counts[task.status] = (counts[task.status] || 0) + 1
      return counts
    },
    {} as Record<number, number>
  )

  return Number(
    Object.entries(statusCounts).reduce((a, b) =>
      statusCounts[Number(a[0])] > statusCounts[Number(b[0])] ? a : b
    )[0]
  )
}

/**
 * Check if a group has multiple different statuses
 */
const hasMultipleStatuses = (tasks: TaskMarker[]): boolean => {
  const uniqueStatuses = new Set(tasks.map((task) => task.status))
  return uniqueStatuses.size > 1
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
    if (processed.has(task.id)) return

    const taskCoord: [number, number] = [task.location.lng, task.location.lat]
    const nearbyTasks: TaskMarker[] = [task]

    // Find all tasks within overlap threshold
    tasks.slice(index + 1).forEach((otherTask) => {
      if (processed.has(otherTask.id)) return

      const otherCoord: [number, number] = [otherTask.location.lng, otherTask.location.lat]
      const distance = calculateDistance(taskCoord, otherCoord)

      if (distance <= OVERLAP_CONFIG.threshold) {
        nearbyTasks.push(otherTask)
        processed.add(otherTask.id)
      }
    })

    processed.add(task.id)

    if (nearbyTasks.length > 1) {
      // Create overlap group
      const coordinates = nearbyTasks.map(
        (t) => [t.location.lng, t.location.lat] as [number, number]
      )
      const center = calculateCenter(coordinates)
      const dominantStatus = getDominantStatus(nearbyTasks)
      const multipleStatuses = hasMultipleStatuses(nearbyTasks)
      const radius = calculateOverlapRadius(nearbyTasks.length)

      overlaps.push({
        id: `overlap-${nearbyTasks.map((t) => t.id).join('-')}`,
        center,
        tasks: nearbyTasks,
        radius,
        hasMultipleStatuses: multipleStatuses,
        dominantStatus,
      })
    } else {
      // Single task, no overlap
      nonOverlapping.push(task)
    }
  })

  return { overlaps, nonOverlapping }
}

/**
 * Create GeoJSON features for overlap visualization
 */
export const createOverlapFeatures = (overlaps: OverlapGroup[]) => {
  const circleFeatures = overlaps.map((overlap) => ({
    type: 'Feature' as const,
    properties: {
      id: overlap.id,
      taskCount: overlap.tasks.length,
      hasMultipleStatuses: overlap.hasMultipleStatuses,
      dominantStatus: overlap.dominantStatus,
      radius: overlap.radius,
      taskIds: overlap.tasks.map((t) => t.id),
    },
    geometry: {
      type: 'Point' as const,
      coordinates: overlap.center,
    },
  }))

  const pointFeatures = overlaps.map((overlap) => ({
    type: 'Feature' as const,
    properties: {
      id: overlap.id,
      taskCount: overlap.tasks.length,
      hasMultipleStatuses: overlap.hasMultipleStatuses,
      dominantStatus: overlap.dominantStatus,
      tasks: overlap.tasks,
    },
    geometry: {
      type: 'Point' as const,
      coordinates: overlap.center,
    },
  }))

  return {
    circles: {
      type: 'FeatureCollection' as const,
      features: circleFeatures,
    },
    points: {
      type: 'FeatureCollection' as const,
      features: pointFeatures,
    },
  }
}
