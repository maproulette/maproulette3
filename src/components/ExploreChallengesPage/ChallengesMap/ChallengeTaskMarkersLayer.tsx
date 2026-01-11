import { useEffect } from 'react'
import { ClusterToggle } from '@/components/shared/TaskMarkers/ClusterToggle'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import { useTaskMarkerSetup } from '@/components/shared/TaskMarkers/hooks/useTaskMarkerSetup'
import { detectOverlappingTasks } from '@/components/shared/TaskMarkers/overlapUtils'
import { createFeatureCollection } from '@/components/shared/TaskMarkers/utils/featureCreation'
import { useExploreChallengesSearchContext } from '../ExploreChallengesSearchContext'
import { useChallengeTaskMarkersContext } from './ChallengeTaskMarkersContext'
import { useExploreChallengesMapContext } from './ExploreChallengesMapContext'

export const ChallengeTaskMarkersLayer = () => {
  const { map, mapLoaded, currentStyleId } = useExploreChallengesMapContext()
  const { taskMarkers, clusters, totalCount, dataLoading } = useChallengeTaskMarkersContext()
  const { cluster, setCluster } = useExploreChallengesSearchContext()

  // Setup map layers using unified hook
  useTaskMarkerSetup({
    map,
    mapLoaded,
    taskMarkers: taskMarkers && taskMarkers.length > 0 ? taskMarkers : undefined,
    clusteringEnabled: !!(
      clusters &&
      clusters.length > 0 &&
      (!taskMarkers || taskMarkers.length === 0)
    ),
    isLoading: dataLoading,
    styleId: currentStyleId,
    useTaskCountFilter: true,
    includeHighlight: false,
  })

  // Update source data when markers or clusters change
  useEffect(() => {
    if (!map.current || dataLoading || !mapLoaded) return
    if (!taskMarkers && !clusters) return

    const existingSource = map.current.getSource(LAYER_IDS.source) as
      | maplibregl.GeoJSONSource
      | undefined

    if (!existingSource) return

    let featureCollection: GeoJSON.FeatureCollection

    if (taskMarkers && taskMarkers.length > 0) {
      const { overlaps } = detectOverlappingTasks(taskMarkers)
      featureCollection = createFeatureCollection(taskMarkers, overlaps)
    } else if (clusters && clusters.length > 0) {
      const clusterFeatures: GeoJSON.Feature[] = clusters.map((cluster) => {
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
        } else {
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
        }
      })

      featureCollection = {
        type: 'FeatureCollection',
        features: clusterFeatures,
      }
    } else {
      return
    }

    existingSource.setData(featureCollection)
  }, [map, mapLoaded, taskMarkers, clusters, dataLoading])

  return (
    <ClusterToggle
      disabled={dataLoading}
      taskCount={totalCount}
      clusteringEnabled={cluster}
      onToggle={setCluster}
      showWarnings={true}
    />
  )
}
