import { useEffect } from 'react'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import type maplibregl from 'maplibre-gl'

interface UseTaskMarkerLayerVisibilityProps {
  map: React.RefObject<maplibregl.Map | null>
  mapLoaded: boolean
  showTaskFeatures: boolean
}

export const useTaskMarkerLayerVisibility = ({
  map,
  mapLoaded,
  showTaskFeatures,
}: UseTaskMarkerLayerVisibilityProps) => {
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    if (!map.current.isStyleLoaded()) {
      const checkStyle = () => {
        if (map.current?.isStyleLoaded()) {
          updateLayerVisibility()
        } else {
          requestAnimationFrame(checkStyle)
        }
      }
      checkStyle()
      return
    }

    updateLayerVisibility()

    function updateLayerVisibility() {
      if (!map.current) return

      const visibility = showTaskFeatures ? 'visible' : 'none'
      const layerIds = [LAYER_IDS.clusters, LAYER_IDS.clusterCount, LAYER_IDS.points]

      layerIds.forEach((layerId) => {
        const layer = map.current?.getLayer(layerId)
        if (layer) {
          try {
            map.current?.setLayoutProperty(layerId, 'visibility', visibility)
          } catch (_error) {
            // Layer might not be ready yet, ignore
          }
        }
      })

      const highlightLayerId = `${LAYER_IDS.points}-highlight`
      const highlightLayer = map.current?.getLayer(highlightLayerId)
      if (highlightLayer) {
        try {
          map.current?.setLayoutProperty(highlightLayerId, 'visibility', visibility)
        } catch (_error) {
          // Layer might not be ready yet, ignore
        }
      }
    }

    const checkLayers = setInterval(() => {
      if (!map.current) {
        clearInterval(checkLayers)
        return
      }

      const hasAllLayers = [LAYER_IDS.clusters, LAYER_IDS.clusterCount, LAYER_IDS.points].every(
        (layerId) => map.current?.getLayer(layerId)
      )

      if (hasAllLayers) {
        updateLayerVisibility()
        clearInterval(checkLayers)
      }
    }, 100)

    return () => {
      clearInterval(checkLayers)
    }
  }, [map, mapLoaded, showTaskFeatures])
}

