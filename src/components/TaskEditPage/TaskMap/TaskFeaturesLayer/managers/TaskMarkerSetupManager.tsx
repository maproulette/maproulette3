import type maplibregl from 'maplibre-gl'
import { useEffect } from 'react'
import { useTaskMarkerSetup } from '@/components/shared/TaskMarkers/hooks/useTaskMarkerSetup'
import type { TaskMarker } from '@/types/Task'

interface TaskMarkerSetupManagerProps {
  map: React.RefObject<maplibregl.Map | null>
  mapLoaded: boolean
  taskMarkers: TaskMarker[] | undefined
  clusteringEnabled: boolean
  isLoading: boolean
  styleId: string
  currentFeatureDataRef: React.MutableRefObject<GeoJSON.FeatureCollection | null>
  setSourceReady: (ready: boolean) => void
  dataRestoredRef: React.MutableRefObject<boolean>
}

/**
 * Manages setup of task marker layers and source
 */
export const TaskMarkerSetupManager = ({
  map,
  mapLoaded,
  taskMarkers,
  clusteringEnabled,
  isLoading,
  styleId,
  currentFeatureDataRef,
  setSourceReady,
  dataRestoredRef,
}: TaskMarkerSetupManagerProps) => {
  useTaskMarkerSetup({
    map,
    mapLoaded,
    taskMarkers,
    clusteringEnabled,
    isLoading,
    includeHighlight: true,
    styleId,
    restoreData: currentFeatureDataRef.current,
    skipEventListeners: true, // Use our own event handlers
    onSetupComplete: () => {
      setSourceReady(true)
      if (currentFeatureDataRef.current) {
        dataRestoredRef.current = true
      }
    },
  })

  useEffect(() => {
    setSourceReady(false)
  }, [styleId, setSourceReady])

  return null
}
