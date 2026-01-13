import maplibregl from 'maplibre-gl'
import { useEffect } from 'react'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'

interface UseTaskMarkerClickHandlerProps {
  map: React.RefObject<maplibregl.Map | null>
  mapLoaded: boolean
}

export const useTaskMarkerClickHandler = ({
  map,
  mapLoaded,
}: UseTaskMarkerClickHandlerProps) => {
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    const directClickHandler = (e: maplibregl.MapMouseEvent) => {
      if (!map.current) return

      // Find task marker features at click point
      const taskLayers = [
        LAYER_IDS.points,
        LAYER_IDS.clusters,
        LAYER_IDS.clusterCount,
      ]

      const features = map.current.queryRenderedFeatures(e.point, {
        layers: taskLayers,
      })

      if (features.length > 0) {
        // Import and call the appropriate handler
        import('@/components/shared/TaskMarkers/eventListeners').then(
          ({ handleMarkerClick, handleClusterClick }) => {
            const feature = features[0]
            const layerId = feature.layer?.id

            if (layerId === LAYER_IDS.clusters || layerId?.includes('cluster')) {
              handleClusterClick(map, e, LAYER_IDS.source)
            } else {
              handleMarkerClick(map, e, LAYER_IDS.source)
            }
          }
        )
      }
    }

    map.current.on('click', directClickHandler)

    return () => {
      if (map.current) {
        map.current.off('click', directClickHandler)
      }
    }
  }, [map, mapLoaded])
}

