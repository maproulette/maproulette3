import type { TaskMarker } from '@/types/Task'
import { detectOverlappingTasks } from '../overlapUtils'
import { createFeatureCollection } from './featureCreation'

/**
 * Create feature collection from task markers
 */
export const createFeatureCollectionFromData = (
  markers: TaskMarker[] | undefined,
  highlightTaskId?: string
): GeoJSON.FeatureCollection | null => {
  if (markers && markers.length > 0) {
    const { overlaps } = detectOverlappingTasks(markers)
    return createFeatureCollection(markers, overlaps, highlightTaskId)
  }

  return null
}
