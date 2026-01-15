import type maplibregl from 'maplibre-gl'
import { useEffect, useRef } from 'react'
import { LAYER_IDS } from '../const'
import type { TaskCluster, TaskMarker } from '@/types/Task'
import { createFeatureCollectionFromData } from '../utils/dataUtils'

interface TaskMarkerDataManagerProps {
  map: React.RefObject<maplibregl.Map | null>
  mapLoaded: boolean
  dataLoading: boolean
  taskMarkers: TaskMarker[] | undefined
  clusters: TaskCluster[] | undefined
}

/**
 * Manages updating the map source data when task markers or clusters change
 * Optimizes updates by tracking previous data to avoid unnecessary re-renders
 */
export const TaskMarkerDataManager = ({
  map,
  mapLoaded,
  dataLoading,
  taskMarkers,
  clusters,
}: TaskMarkerDataManagerProps) => {
  // Track previous data to avoid unnecessary updates
  const prevTaskMarkersLengthRef = useRef(taskMarkers?.length ?? 0)
  const prevClustersLengthRef = useRef(clusters?.length ?? 0)
  const prevTaskMarkersRef = useRef(taskMarkers)
  const prevClustersRef = useRef(clusters)

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

    // Create and set new feature collection
    const featureCollection = createFeatureCollectionFromData(taskMarkers, clusters)
    if (!featureCollection) return

    existingSource.setData(featureCollection)
  }, [map, mapLoaded, taskMarkers, clusters, dataLoading])

  return null
}

