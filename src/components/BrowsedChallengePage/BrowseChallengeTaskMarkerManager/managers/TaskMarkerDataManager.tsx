import type maplibregl from 'maplibre-gl'
import { useEffect, useRef } from 'react'
import type { TaskMarker } from '@/types/Task'
import { LAYER_IDS } from '../const'
import { createFeatureCollectionFromData } from '../utils/dataUtils'

interface TaskMarkerDataManagerProps {
  map: React.RefObject<maplibregl.Map | null>
  mapLoaded: boolean
  dataLoading: boolean
  taskMarkers: TaskMarker[] | undefined
  clusteringEnabled: boolean
}

/**
 * Manages updating the map source data when task markers change
 */
export const TaskMarkerDataManager = ({
  map,
  mapLoaded,
  dataLoading,
  taskMarkers,
  clusteringEnabled,
}: TaskMarkerDataManagerProps) => {
  const prevDataRef = useRef<{
    taskMarkers?: TaskMarker[]
    clusteringEnabled?: boolean
  }>({})

  useEffect(() => {
    if (!map.current || !mapLoaded || dataLoading) return

    const source = map.current.getSource(LAYER_IDS.source) as maplibregl.GeoJSONSource | undefined
    if (!source) return

    const prev = prevDataRef.current
    const dataChanged = prev.taskMarkers !== taskMarkers
    const clusteringChanged = prev.clusteringEnabled !== clusteringEnabled

    if (!dataChanged && !clusteringChanged) return

    prevDataRef.current = { taskMarkers, clusteringEnabled }

    const featureCollection = createFeatureCollectionFromData(taskMarkers)

    source.setData(
      featureCollection ?? {
        type: 'FeatureCollection' as const,
        features: [],
      }
    )
  }, [map, mapLoaded, taskMarkers, dataLoading, clusteringEnabled])

  return null
}
