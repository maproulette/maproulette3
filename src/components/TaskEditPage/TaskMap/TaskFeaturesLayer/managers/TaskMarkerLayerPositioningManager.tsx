import type maplibregl from 'maplibre-gl'
import { useEffect } from 'react'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import { repositionTaskFeaturesLayers } from '../taskFeaturesLayerPositioning'

interface TaskMarkerLayerPositioningManagerProps {
  map: React.RefObject<maplibregl.Map | null>
  mapLoaded: boolean
  sourceReady: boolean
  dataLayerOrder: ('task-features' | 'osm-data')[]
}

/**
 * Manages positioning of task marker layers based on dataLayerOrder
 */
export const TaskMarkerLayerPositioningManager = ({
  map,
  mapLoaded,
  sourceReady,
  dataLayerOrder,
}: TaskMarkerLayerPositioningManagerProps) => {
  useEffect(() => {
    if (!map.current || !mapLoaded || !sourceReady) return

    const existingLayers = [
      LAYER_IDS.clusters,
      LAYER_IDS.clusterCount,
      LAYER_IDS.points,
      `${LAYER_IDS.points}-highlight`,
    ].filter((id) => map.current?.getLayer(id))

    if (existingLayers.length > 0) {
      repositionTaskFeaturesLayers(map.current, existingLayers, dataLayerOrder)
    }
  }, [map, mapLoaded, sourceReady, dataLayerOrder])

  return null
}
