import type maplibregl from 'maplibre-gl'
import { useEffect } from 'react'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import { repositionTaskFeaturesLayers } from '../taskFeaturesLayerPositioning'

interface UseTaskMarkerLayerPositioningProps {
  map: React.RefObject<maplibregl.Map | null>
  mapLoaded: boolean
  sourceReady: boolean
  dataLayerOrder: ('task-features' | 'osm-data')[]
}

export const useTaskMarkerLayerPositioning = ({
  map,
  mapLoaded,
  sourceReady,
  dataLayerOrder,
}: UseTaskMarkerLayerPositioningProps) => {
  useEffect(() => {
    if (!map.current || !mapLoaded || !sourceReady) return

    const checkAndPositionLayers = () => {
      const existingLayers = [
        LAYER_IDS.clusters,
        LAYER_IDS.clusterCount,
        LAYER_IDS.points,
        `${LAYER_IDS.points}-highlight`,
      ].filter((id) => map.current?.getLayer(id))

      if (existingLayers.length > 0 && map.current) {
        repositionTaskFeaturesLayers(map.current, existingLayers, dataLayerOrder)
      }
    }

    // Check immediately
    checkAndPositionLayers()

    // Also set up an interval to check periodically in case layers are added asynchronously
    const intervalId = setInterval(() => {
      if (!map.current) {
        clearInterval(intervalId)
        return
      }
      checkAndPositionLayers()
    }, 100)

    return () => {
      clearInterval(intervalId)
    }
  }, [map, mapLoaded, sourceReady, dataLayerOrder])
}
