import { useEffect } from 'react'
import { addMapLayers } from '@/components/shared/TaskMarkers/addMapLayers'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import { createMarkerIcons } from '@/components/shared/TaskMarkers/createMarkerIcons'
import { detectOverlappingTasks } from '@/components/shared/TaskMarkers/overlapUtils'
import { createFeatureCollection } from '@/components/shared/TaskMarkers/utils/featureCreation'
import { useChallengeTaskMarkersContext } from '@/contexts/exploreChallenges/ChallengeTaskMarkersContext'
import { useMapContext } from '@/contexts/MapContext'
import { ClusterToggle } from '../ChallengesMap/ClusterToggle'
import { setupEventListeners } from '@/components/shared/TaskMarkers/eventListeners'
import { cleanupLayers, cleanupPopups } from '@/components/shared/TaskMarkers/utils/mapCleanup'

export const ChallengeTaskMarkersLayer = () => {
  const { map, mapLoaded, currentStyleId } = useMapContext()
  const { taskMarkers, clusters, totalCount, dataLoading } = useChallengeTaskMarkersContext()

  useEffect(() => {
    if (!map.current || dataLoading || !mapLoaded) return

    if (!taskMarkers && !clusters) return

    const addMarkers = () => {
      if (!map.current) return

      createMarkerIcons(map)
      cleanupLayers(map.current)
      cleanupPopups()

      if (taskMarkers && taskMarkers.length > 0) {
        const { overlaps } = detectOverlappingTasks(taskMarkers)
        const featureCollection = createFeatureCollection(taskMarkers, overlaps)

        map.current.addSource(LAYER_IDS.source, {
          type: 'geojson',
          data: featureCollection,
          cluster: false,
        })

        addMapLayers(map, { includeHighlight: false, useTaskCountFilter: true })
        setupEventListeners(map)
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

        const featureCollection: GeoJSON.FeatureCollection = {
          type: 'FeatureCollection',
          features: clusterFeatures,
        }

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

        addMapLayers(map, { includeHighlight: false, useTaskCountFilter: true })
        setupEventListeners(map)
      }
    }

    addMarkers()

    const handleStyleLoad = () => {
      addMarkers()
    }

    map.current.on('style.load', handleStyleLoad)

    return () => {
      if (map.current) {
        map.current.off('style.load', handleStyleLoad)
      }
      cleanupPopups()
    }
  }, [map, mapLoaded, taskMarkers, clusters, dataLoading, currentStyleId])

  return <ClusterToggle disabled={dataLoading} taskCount={totalCount} />
}
