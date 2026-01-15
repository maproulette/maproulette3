import type maplibregl from 'maplibre-gl'
import { useEffect } from 'react'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import { useTaskMarkerSetup } from '@/components/shared/TaskMarkers/hooks/useTaskMarkerSetup'
import { detectOverlappingTasks } from '@/components/shared/TaskMarkers/overlapUtils'
import { createFeatureCollection } from '@/components/shared/TaskMarkers/utils/featureCreation'
import type { TaskCluster, TaskMarker } from '@/types/Task'
import { useChallengeTaskMarkersContext } from '../ChallengeTaskMarkersContext'
import { useExploreChallengesMapContext } from '../ExploreChallengesMapContext'

/**
 * Create feature collection from task markers or clusters
 */
const createFeatureCollectionFromData = (
  markers: TaskMarker[] | undefined,
  clusterData: TaskCluster[] | undefined
): GeoJSON.FeatureCollection | null => {
  if (markers && markers.length > 0) {
    const { overlaps } = detectOverlappingTasks(markers)
    return createFeatureCollection(markers, overlaps)
  }

  if (clusterData && clusterData.length > 0) {
    const clusterFeatures: GeoJSON.Feature[] = clusterData.map((cluster) => {
      if (cluster.taskId !== undefined && cluster.taskStatus !== undefined) {
        return {
          type: 'Feature',
          properties: {
            id: cluster.taskId,
            status: cluster.taskStatus,
            isOverlapping: false,
            taskCount: 1,
          },
          geometry: {
            type: 'Point',
            coordinates: [cluster.point.lng, cluster.point.lat],
          },
        } as GeoJSON.Feature
      }

      return {
        type: 'Feature',
        properties: {
          taskCount: cluster.numberOfPoints,
        },
        geometry: {
          type: 'Point',
          coordinates: [cluster.point.lng, cluster.point.lat],
        },
      } as GeoJSON.Feature
    })

    return {
      type: 'FeatureCollection',
      features: clusterFeatures,
    }
  }

  return null
}

/**
 * Determine if clustering should be enabled based on available data
 */
const shouldEnableClustering = (
  clusters: TaskCluster[] | undefined,
  taskMarkers: TaskMarker[] | undefined
): boolean => {
  return !!(clusters && clusters.length > 0 && (!taskMarkers || taskMarkers.length === 0))
}

/**
 * Hook to manage challenge task markers on the map
 * Handles setup, clustering, and updating marker data
 */
export const useChallengeTaskMarkers = (): void => {
  const { map, mapLoaded, currentStyleId } = useExploreChallengesMapContext()
  const { taskMarkers, clusters, dataLoading } = useChallengeTaskMarkersContext()

  const hasTaskMarkers = taskMarkers && taskMarkers.length > 0
  const clusteringEnabled = shouldEnableClustering(clusters, taskMarkers)

  // Setup map layers using unified hook
  useTaskMarkerSetup({
    map,
    mapLoaded,
    taskMarkers: hasTaskMarkers ? taskMarkers : undefined,
    clusteringEnabled,
    isLoading: dataLoading,
    styleId: currentStyleId,
    useTaskCountFilter: true,
    includeHighlight: false,
  })

  // Update source data when markers or clusters change
  useEffect(() => {
    if (!map.current || dataLoading || !mapLoaded) return

    const existingSource = map.current.getSource(LAYER_IDS.source) as
      | maplibregl.GeoJSONSource
      | undefined

    if (!existingSource) return

    const featureCollection = createFeatureCollectionFromData(taskMarkers, clusters)
    if (!featureCollection) return

    existingSource.setData(featureCollection)
  }, [map, mapLoaded, taskMarkers, clusters, dataLoading])
}
