import type { TaskMarker } from '@/types/Task'
import type { OverlapGroup } from '../types'

/**
 * Create GeoJSON features from task markers with overlap detection
 */
export const createTaskFeatures = (
  taskMarkers: TaskMarker[],
  overlaps: OverlapGroup[],
  highlightTaskId?: string
): GeoJSON.Feature[] => {
  return taskMarkers.map((marker) => {
    const overlapGroup = overlaps.find((overlap) =>
      overlap.tasks.some((task) => task.id === marker.id)
    )

    const isHighlighted = highlightTaskId && String(marker.id) === String(highlightTaskId)

    return {
      type: 'Feature',
      id: marker.id,
      properties: {
        id: marker.id,
        status: marker.status,
        difficulty: marker.priority,
        isOverlapping: !!overlapGroup,
        overlapId: overlapGroup?.id,
        overlapTaskCount: overlapGroup?.tasks.length,
        isHighlighted: isHighlighted,
      },
      geometry: {
        type: 'Point',
        coordinates: [marker.location.lng, marker.location.lat],
      },
    } as GeoJSON.Feature
  })
}

/**
 * Create a complete GeoJSON FeatureCollection from task markers
 */
export const createFeatureCollection = (
  taskMarkers: TaskMarker[],
  overlaps: OverlapGroup[],
  highlightTaskId?: string
): GeoJSON.FeatureCollection => {
  return {
    type: 'FeatureCollection',
    features: createTaskFeatures(taskMarkers, overlaps, highlightTaskId),
  }
}
