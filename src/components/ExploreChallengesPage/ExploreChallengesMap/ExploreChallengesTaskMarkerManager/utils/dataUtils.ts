import type { TaskCluster, TaskMarker } from '@/types/Task'
import { detectOverlappingTasks } from '../overlapUtils'
import { createFeatureCollection } from './featureCreation'

/**
 * Create feature collection from task markers or clusters
 */
export const createFeatureCollectionFromData = (
  markers: TaskMarker[] | undefined,
  clusterData: TaskCluster[] | undefined
): GeoJSON.FeatureCollection | null => {
  if (markers && markers.length > 0) {
    const { overlaps } = detectOverlappingTasks(markers)
    return createFeatureCollection(markers, overlaps)
  }

  if (clusterData && clusterData.length > 0) {
    return {
      type: 'FeatureCollection',
      features: clusterData.map((cluster, index) => {
        if (cluster.taskId !== undefined && cluster.taskStatus !== undefined) {
          return {
            type: 'Feature',
            id: cluster.taskId,
            properties: {
              id: cluster.taskId,
              status: cluster.taskStatus,
              isOverlapping: false,
            },
            geometry: {
              type: 'Point',
              coordinates: [cluster.point.lng, cluster.point.lat],
            },
          } as GeoJSON.Feature
        }

        return {
          type: 'Feature',
          id: `cluster-${index}`,
          properties: {
            taskCount: cluster.numberOfPoints || 1,
          },
          geometry: {
            type: 'Point',
            coordinates: [cluster.point.lng, cluster.point.lat],
          },
        } as GeoJSON.Feature
      }),
    }
  }

  return null
}
