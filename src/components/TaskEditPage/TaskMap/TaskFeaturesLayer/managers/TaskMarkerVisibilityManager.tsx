import type maplibregl from 'maplibre-gl'
import { useEffect } from 'react'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'

interface TaskMarkerVisibilityManagerProps {
  map: React.RefObject<maplibregl.Map | null>
  mapLoaded: boolean
  sourceReady: boolean
  showTaskFeatures: boolean
}

/**
 * Manages visibility of task marker layers
 */
export const TaskMarkerVisibilityManager = ({
  map,
  mapLoaded,
  sourceReady,
  showTaskFeatures,
}: TaskMarkerVisibilityManagerProps) => {
  useEffect(() => {
    if (!map.current || !mapLoaded || !sourceReady) return

    const updateLayerVisibility = () => {
      if (!map.current) return

      const visibility = showTaskFeatures ? 'visible' : 'none'
      const layerIds = [LAYER_IDS.clusters, LAYER_IDS.clusterCount, LAYER_IDS.points]

      layerIds.forEach((layerId) => {
        const layer = map.current?.getLayer(layerId)
        if (layer) {
          try {
            map.current?.setLayoutProperty(layerId, 'visibility', visibility)
          } catch {
            // Ignore errors
          }
        }
      })

      const highlightLayerId = `${LAYER_IDS.points}-highlight`
      const highlightLayer = map.current?.getLayer(highlightLayerId)
      if (highlightLayer) {
        try {
          map.current?.setLayoutProperty(highlightLayerId, 'visibility', visibility)
        } catch {
          // Ignore errors
        }
      }
    }

    // Check if layers exist before updating visibility
    if (map.current.isStyleLoaded()) {
      updateLayerVisibility()
    } else {
      const checkStyle = () => {
        if (map.current?.isStyleLoaded()) {
          updateLayerVisibility()
        } else {
          requestAnimationFrame(checkStyle)
        }
      }
      checkStyle()
    }
  }, [map, mapLoaded, sourceReady, showTaskFeatures])

  return null
}
