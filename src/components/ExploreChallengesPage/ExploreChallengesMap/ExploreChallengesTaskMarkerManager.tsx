import type maplibregl from 'maplibre-gl'
import { useEffect, useMemo, useRef } from 'react'
import { detectOverlappingTasks } from './TaskMarkers/overlapUtils'
import { createFeatureCollection } from './TaskMarkers/utils/featureCreation'
import { LAYER_IDS } from './addMapLayers'
import type { TaskCluster, TaskMarker } from '@/types/Task'
import { useChallengeTaskMarkersContext } from './ChallengeTaskMarkersContext'
import { useExploreChallengesMapContext } from './ExploreChallengesMapContext'
import { createMarkerIcons } from './TaskMarkers/createMarkerIcons'
import { setupEventListeners } from './TaskMarkers/eventListeners'
import { cleanupLayers, cleanupPopups } from './TaskMarkers/utils/mapCleanup'
import { addMapLayers } from './addMapLayers'

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
 * Component to manage challenge task markers on the map
 * Handles setup, clustering, and updating marker data
 */
export const ExploreChallengesTaskMarkerManager = () => {
  const { map, mapLoaded, currentStyleId } = useExploreChallengesMapContext()
  const { taskMarkers, clusters, dataLoading } = useChallengeTaskMarkersContext()

  const isLoading = dataLoading
  const styleId = currentStyleId
  const useTaskCountFilter = true
  const includeHighlight = false

  // Memoize clustering enabled to prevent unnecessary recalculations
  const clusteringEnabled = useMemo(
    () => shouldEnableClustering(clusters, taskMarkers),
    [clusters, taskMarkers]
  )

  const prevStyleIdRef = useRef(styleId)
  const prevClusteringRef = useRef(clusteringEnabled)
  const isInitializedRef = useRef(false)
  const eventListenerCleanupRef = useRef<(() => void) | null>(null)
  
  // Track previous data to avoid unnecessary updates
  const prevTaskMarkersLengthRef = useRef(taskMarkers?.length ?? 0)
  const prevClustersLengthRef = useRef(clusters?.length ?? 0)
  const prevTaskMarkersRef = useRef(taskMarkers)
  const prevClustersRef = useRef(clusters)

  useEffect(() => {
    if (!map.current || !mapLoaded || isLoading) {
      return
    }

    const styleChanged = prevStyleIdRef.current !== styleId
    const clusteringChanged = prevClusteringRef.current !== clusteringEnabled

    if (styleChanged) {
      prevStyleIdRef.current = styleId
      isInitializedRef.current = false
    }
    if (clusteringChanged) {
      prevClusteringRef.current = clusteringEnabled
    }

    const setupMarkers = () => {
      if (!map.current) {
        return
      }

      if (!map.current.isStyleLoaded()) {
        requestAnimationFrame(() => {
          if (map.current?.isStyleLoaded()) {
            setupMarkers()
          } else {
            setTimeout(setupMarkers, 10)
          }
        })
        return
      }

      try {
        if (eventListenerCleanupRef.current) {
          eventListenerCleanupRef.current()
          eventListenerCleanupRef.current = null
        }

        createMarkerIcons(map)

        const existingSource = map.current.getSource(LAYER_IDS.source) as
          | maplibregl.GeoJSONSource
          | undefined

        if (existingSource && !styleChanged && !clusteringChanged && isInitializedRef.current) {
          // Even if source exists, make sure event listeners are set up (unless skipped)
          if (true && !eventListenerCleanupRef.current) {
            eventListenerCleanupRef.current = setupEventListeners(map, LAYER_IDS)
          }
          return
        }

        if (existingSource) {
          cleanupLayers(map.current, includeHighlight)
        }

        if (styleChanged || clusteringChanged) {
          cleanupPopups()
        }

        const initialData = {
          type: 'FeatureCollection',
          features: [],
        } 

        try {
          map.current.addSource(LAYER_IDS.source, {
            type: 'geojson',
            data: initialData as GeoJSON.FeatureCollection,
            cluster: clusteringEnabled,
            clusterMaxZoom: 14,
            clusterRadius: 50,
            promoteId: 'id',
          })
          console.log('Task marker source added', { sourceId: LAYER_IDS.source, clusteringEnabled })
        } catch (error) {
          const source = map.current.getSource(LAYER_IDS.source) as
            | maplibregl.GeoJSONSource
            | undefined
          if (!source) {
            console.error('Failed to add source:', error)
            return
          }

  
        }

        addMapLayers(map, {
          includeHighlight,
          useTaskCountFilter,
        })

        if (true) {
          eventListenerCleanupRef.current = setupEventListeners(map, LAYER_IDS)
        }

        isInitializedRef.current = true
      } catch (error) {
        console.error('Error setting up task markers:', error)
      }
    }

    setupMarkers()

    const handleStyleLoad = () => {
      isInitializedRef.current = false
      setupMarkers()
    }

    map.current.on('style.load', handleStyleLoad)

    return () => {
      if (map.current) {
        map.current.off('style.load', handleStyleLoad)
      }

      if (eventListenerCleanupRef.current) {
        eventListenerCleanupRef.current()
        eventListenerCleanupRef.current = null
      }
    }
  }, [
    map,
    mapLoaded,
    clusteringEnabled,
    isLoading,
    styleId,
    useTaskCountFilter,
    includeHighlight,
  ])

  useEffect(() => {
    return () => {
      cleanupPopups()
    }
  }, [])

  // Update source data when markers or clusters change
  useEffect(() => {
    if (!map.current || dataLoading || !mapLoaded) return

    const existingSource = map.current.getSource(LAYER_IDS.source) as
      | maplibregl.GeoJSONSource
      | undefined

    if (!existingSource) return

    // Check if data actually changed to avoid unnecessary updates
    const taskMarkersLength = taskMarkers?.length ?? 0
    const clustersLength = clusters?.length ?? 0
    const taskMarkersChanged =
      prevTaskMarkersLengthRef.current !== taskMarkersLength ||
      prevTaskMarkersRef.current !== taskMarkers
    const clustersChanged =
      prevClustersLengthRef.current !== clustersLength ||
      prevClustersRef.current !== clusters

    if (!taskMarkersChanged && !clustersChanged) {
      return
    }

    // Update refs
    prevTaskMarkersLengthRef.current = taskMarkersLength
    prevClustersLengthRef.current = clustersLength
    prevTaskMarkersRef.current = taskMarkers
    prevClustersRef.current = clusters

    const featureCollection = createFeatureCollectionFromData(taskMarkers, clusters)
    if (!featureCollection) return

    existingSource.setData(featureCollection)
  }, [map, mapLoaded, taskMarkers, clusters, dataLoading])

  return null
}
