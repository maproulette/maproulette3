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
  const { taskMarkers, clusters, dataLoading, totalCount } = useChallengeTaskMarkersContext()

  useEffect(() => {
    if (!map.current || dataLoading || !mapLoaded) return

    // If we don't have either taskMarkers or clusters, don't render anything
    if (!taskMarkers && !clusters) return

    createMarkerIcons(map)
    cleanupLayers(map.current)
    cleanupPopups()

    // If we have taskMarkers, use them directly
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
    }
    // If we have clusters from backend, render them as pre-clustered data
    else if (clusters && clusters.length > 0) {
      // Create GeoJSON features from backend clusters
      const clusterFeatures: GeoJSON.Feature[] = clusters.map((cluster) => {
        // If cluster has a defined taskId, treat it as an individual task marker
        if (cluster.taskId !== undefined && cluster.taskStatus !== undefined) {
          return {
            type: 'Feature',
            properties: {
              id: cluster.taskId,
              status: cluster.taskStatus,
              isOverlapping: false,
              taskCount: 1, // MapLibre uses point_count for clustering
            },
            geometry: {
              type: 'Point',
              coordinates: [cluster.point.lng, cluster.point.lat],
            },
          } as GeoJSON.Feature
        }
        // For clusters without taskId, create cluster features
        else {
          return {
            type: 'Feature',
            properties: {
              taskCount: cluster.numberOfPoints, // MapLibre will sum these when clustering
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

      // Enable MapLibre's client-side clustering to combine overlapping backend clusters
      map.current.addSource(LAYER_IDS.source, {
        type: 'geojson',
        data: featureCollection,
        cluster: true,
        clusterRadius: 50, // Cluster radius in pixels
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterProperties: {
          // Sum up point_count from backend clusters
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
