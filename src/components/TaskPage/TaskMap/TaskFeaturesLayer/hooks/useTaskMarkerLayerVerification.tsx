import type maplibregl from 'maplibre-gl'
import { useEffect } from 'react'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'

interface UseTaskMarkerLayerVerificationProps {
  map: React.RefObject<maplibregl.Map | null>
  mapLoaded: boolean
  sourceReady: boolean
  dataLayerOrder: ('task-features' | 'osm-data')[]
}

export const useTaskMarkerLayerVerification = ({
  map,
  mapLoaded,
  sourceReady,
  dataLayerOrder,
}: UseTaskMarkerLayerVerificationProps) => {
  useEffect(() => {
    if (!map.current || !mapLoaded || !sourceReady) return

    // Wait for layers to be positioned, then verify event listeners are working
    const timeoutId = setTimeout(() => {
      if (!map.current) return

      const pointLayer = map.current.getLayer(LAYER_IDS.points)
      const clusterLayer = map.current.getLayer(LAYER_IDS.clusters)
      const source = map.current.getSource(LAYER_IDS.source)

      console.log('TaskFeaturesLayer: Verifying layers and handlers', {
        pointLayer: { exists: !!pointLayer, id: LAYER_IDS.points },
        clusterLayer: { exists: !!clusterLayer, id: LAYER_IDS.clusters },
        source: { exists: !!source, id: LAYER_IDS.source },
        allTaskLayers: map.current
          .getStyle()
          ?.layers?.filter((l) => l.id.includes('task') || l.id.includes('cluster'))
          .map((l) => ({ id: l.id, type: l.type })),
      })

      // Verify layers exist and are visible
      if (pointLayer) {
        const layout = pointLayer.layout as { visibility?: string } | undefined
        if (layout?.visibility === 'none') {
          console.log('TaskFeaturesLayer: Point layer is hidden, making visible')
          map.current.setLayoutProperty(LAYER_IDS.points, 'visibility', 'visible')
        }
      } else {
        console.warn('TaskFeaturesLayer: Point layer does not exist!', LAYER_IDS.points)
      }

      if (clusterLayer) {
        const layout = clusterLayer.layout as { visibility?: string } | undefined
        if (layout?.visibility === 'none') {
          console.log('TaskFeaturesLayer: Cluster layer is hidden, making visible')
          map.current.setLayoutProperty(LAYER_IDS.clusters, 'visibility', 'visible')
        }
      } else {
        console.warn('TaskFeaturesLayer: Cluster layer does not exist!', LAYER_IDS.clusters)
      }

      if (!source) {
        console.error('TaskFeaturesLayer: Source does not exist!', LAYER_IDS.source)
      }
    }, 500)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [map, mapLoaded, sourceReady, dataLayerOrder])
}
