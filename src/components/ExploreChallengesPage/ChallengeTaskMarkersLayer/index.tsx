import { useEffect } from 'react'
import { useChallengeTaskMarkersContext } from '@/contexts/exploreChallenges/ChallengeTaskMarkersContext'
import { useMapContext } from '@/contexts/MapContext'
import { ClusterToggle } from '../ChallengesMap/ClusterToggle'
import { addMapLayers } from './addMapLayers'
import { LAYER_IDS } from './const'
import { createMarkerIcons } from './createMarkerIcons'
import { setupEventListeners } from './eventListeners'
import { detectOverlappingTasks } from './overlapUtils'
import { createFeatureCollection } from './utils/featureCreation'
import { cleanupLayers, cleanupPopups } from './utils/mapCleanup'

export const ChallengeTaskMarkersLayer = () => {
  const { map, mapLoaded } = useMapContext()
  const { taskMarkers, clusters, totalCount, dataLoading } = useChallengeTaskMarkersContext()

  useEffect(() => {
    if (!map.current || dataLoading || !mapLoaded) return

    if (!taskMarkers && !clusters) return

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

      addMapLayers(map)
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

      addMapLayers(map)
      setupEventListeners(map)
    }

    return () => {
      cleanupPopups()
    }
  }, [map, mapLoaded, taskMarkers, clusters, dataLoading])

  return <ClusterToggle disabled={dataLoading} taskCount={totalCount} />
}
