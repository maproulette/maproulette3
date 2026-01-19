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
  highlightTaskId?: string
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
  highlightTaskId,
}: TaskMarkerDataManagerProps) => {
  const prevDataRef = useRef<{
    taskMarkers?: TaskMarker[]
    clusteringEnabled?: boolean
    highlightTaskId?: string
  }>({})

  useEffect(() => {
    if (!map.current || !mapLoaded || dataLoading) return

    const source = map.current.getSource(LAYER_IDS.source) as maplibregl.GeoJSONSource | undefined
    if (!source) return

    const prev = prevDataRef.current
    const dataChanged = prev.taskMarkers !== taskMarkers
    const clusteringChanged = prev.clusteringEnabled !== clusteringEnabled
    const highlightChanged = prev.highlightTaskId !== highlightTaskId

    if (!dataChanged && !clusteringChanged && !highlightChanged) return

    prevDataRef.current = { taskMarkers, clusteringEnabled, highlightTaskId }

    const featureCollection = createFeatureCollectionFromData(taskMarkers, highlightTaskId)

    source.setData(
      featureCollection ?? {
        type: 'FeatureCollection' as const,
        features: [],
      }
    )

    // Set feature state for highlighted task after data is loaded
    if (highlightTaskId && featureCollection && map.current) {
      const highlightedFeature = featureCollection.features.find(
        (f) => f.id && String(f.id) === String(highlightTaskId)
      )
      if (highlightedFeature && highlightedFeature.id !== undefined) {
        try {
          map.current.setFeatureState(
            { source: LAYER_IDS.source, id: highlightedFeature.id },
            { highlighted: true }
          )
        } catch (_error) {
          // Feature might not be loaded yet, ignore
        }
      }
    }
  }, [map, mapLoaded, taskMarkers, dataLoading, clusteringEnabled, highlightTaskId])

  return null
}
