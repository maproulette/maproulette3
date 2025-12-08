import { useEffect, useRef } from 'react'
import { addMapLayers } from '@/components/shared/TaskMarkers/addMapLayers'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import { createMarkerIcons } from '@/components/shared/TaskMarkers/createMarkerIcons'
import { setupEventListeners } from '@/components/shared/TaskMarkers/eventListeners'
import { detectOverlappingTasks } from '@/components/shared/TaskMarkers/overlapUtils'
import { createFeatureCollection } from '@/components/shared/TaskMarkers/utils/featureCreation'
import { cleanupLayers, cleanupPopups } from '@/components/shared/TaskMarkers/utils/mapCleanup'
import { useChallengeTaskMarkersContext } from './ChallengeTaskMarkersContext'
import { ClusterToggle } from './ClusterToggle'
import { useExploreChallengesMapContext } from './ExploreChallengesMapContext'

export const ChallengeTaskMarkersLayer = () => {
  const { map, mapLoaded, currentStyleId } = useExploreChallengesMapContext()
  const { taskMarkers, clusters, totalCount, dataLoading } = useChallengeTaskMarkersContext()
  const prevStyleIdRef = useRef(currentStyleId)
  const isClusterModeRef = useRef<boolean | null>(null)

  useEffect(() => {
    if (!map.current || dataLoading || !mapLoaded) return

    if (!taskMarkers && !clusters) return

    const styleChanged = prevStyleIdRef.current !== currentStyleId
    prevStyleIdRef.current = currentStyleId

    const isClusterMode = !!(
      clusters &&
      clusters.length > 0 &&
      (!taskMarkers || taskMarkers.length === 0)
    )
    const modeChanged =
      isClusterModeRef.current !== null && isClusterModeRef.current !== isClusterMode
    isClusterModeRef.current = isClusterMode

    const existingSource = map.current.getSource(LAYER_IDS.source) as
      | maplibregl.GeoJSONSource
      | undefined

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

    if (existingSource && !styleChanged && !modeChanged) {
      existingSource.setData(featureCollection)
      return
    }

    const setupMarkers = () => {
      if (!map.current) return

      createMarkerIcons(map)
      cleanupLayers(map.current)

      if (styleChanged || modeChanged) {
        cleanupPopups()
      }

      if (taskMarkers && taskMarkers.length > 0) {
        map.current.addSource(LAYER_IDS.source, {
          type: 'geojson',
          data: featureCollection,
          cluster: false,
        })
      } else if (clusters && clusters.length > 0) {
        map.current.addSource(LAYER_IDS.source, {
          type: 'geojson',
          data: featureCollection,
          cluster: true,
          clusterRadius: 50,
          clusterMaxZoom: 14,
          clusterProperties: {
            taskCount: ['+', ['get', 'taskCount']],
          },
        })
      }

      addMapLayers(map, { includeHighlight: false, useTaskCountFilter: true })
      setupEventListeners(map)
    }

    setupMarkers()

    const handleStyleLoad = () => {
      setupMarkers()
    }

    map.current.on('style.load', handleStyleLoad)

    return () => {
      if (map.current) {
        map.current.off('style.load', handleStyleLoad)
      }
    }
  }, [map, mapLoaded, taskMarkers, clusters, dataLoading, currentStyleId])

  useEffect(() => {
    return () => {
      cleanupPopups()
    }
  }, [])

  return <ClusterToggle disabled={dataLoading} taskCount={totalCount} />
}
