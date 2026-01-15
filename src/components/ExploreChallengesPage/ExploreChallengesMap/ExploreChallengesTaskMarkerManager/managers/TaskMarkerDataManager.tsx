import type maplibregl from 'maplibre-gl'
import { useEffect, useRef } from 'react'
import type { TaskCluster, TaskMarker } from '@/types/Task'
import { LAYER_IDS } from '../const'
import { createFeatureCollectionFromData } from '../utils/dataUtils'

interface TaskMarkerDataManagerProps {
  map: React.RefObject<maplibregl.Map | null>
  mapLoaded: boolean
  dataLoading: boolean
  taskMarkers: TaskMarker[] | undefined
  clusters: TaskCluster[] | undefined
  clusteringEnabled: boolean
}

/**
 * Manages updating the map source data when task markers or clusters change
 * When clustering is disabled, prioritizes taskMarkers over clusters
 */
export const TaskMarkerDataManager = ({
  map,
  mapLoaded,
  dataLoading,
  taskMarkers,
  clusters,
  clusteringEnabled,
}: TaskMarkerDataManagerProps) => {
  const prevDataRef = useRef<{
    taskMarkers?: TaskMarker[]
    clusters?: TaskCluster[]
    clusteringEnabled?: boolean
  }>({})

  useEffect(() => {
    if (!map.current || !mapLoaded || dataLoading) return

    const source = map.current.getSource(LAYER_IDS.source) as maplibregl.GeoJSONSource | undefined
    if (!source) return

    const prev = prevDataRef.current
    const dataChanged = prev.taskMarkers !== taskMarkers || prev.clusters !== clusters
    const clusteringChanged = prev.clusteringEnabled !== clusteringEnabled

    if (!dataChanged && !clusteringChanged) return

    prevDataRef.current = { taskMarkers, clusters, clusteringEnabled }

    // When clustering is disabled, prioritize taskMarkers; when enabled, use clusters if taskMarkers aren't available
    const featureCollection = createFeatureCollectionFromData(
      taskMarkers,
      clusteringEnabled ? clusters : undefined
    )

    source.setData(
      featureCollection ?? {
        type: 'FeatureCollection' as const,
        features: [],
      }
    )
  }, [map, mapLoaded, taskMarkers, clusters, dataLoading, clusteringEnabled])

  return null
}
