import type { TaskMarker } from '@/types/Task'
import type { OverlapGroup } from '../types'

/**
 * Create GeoJSON features from task markers with overlap detection
 */
export const createTaskFeatures = (
  taskMarkers: TaskMarker[],
  overlaps: OverlapGroup[],
  highlightTaskId?: string,
  selectedTaskIds?: number[],
  hoveredTaskId?: number | null
): GeoJSON.Feature[] => {
  return taskMarkers.map((marker) => {
    const overlapGroup = overlaps.find((overlap) =>
      overlap.tasks.some((task) => task.id === marker.id)
    )

    const isHighlighted = highlightTaskId && String(marker.id) === String(highlightTaskId)
    const isSelected = selectedTaskIds ? selectedTaskIds.includes(marker.id) : false
    const isHovered = hoveredTaskId !== null && marker.id === hoveredTaskId

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
        isSelected: isSelected,
        isHovered: isHovered,
      },
      geometry: {
        type: 'Point',
        coordinates: [marker.location.lng, marker.location.lat],
      },
    }
  })
}

/**
 * Create a complete GeoJSON FeatureCollection from task markers
 */
export const createFeatureCollection = (
  taskMarkers: TaskMarker[],
  overlaps: OverlapGroup[],
  highlightTaskId?: string,
  selectedTaskIds?: number[],
  hoveredTaskId?: number | null
): GeoJSON.FeatureCollection => {
  return {
    type: 'FeatureCollection',
    features: createTaskFeatures(
      taskMarkers,
      overlaps,
      highlightTaskId,
      selectedTaskIds,
      hoveredTaskId
    ),
  }
}
