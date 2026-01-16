import type maplibregl from 'maplibre-gl'
import type { TaskFeaturesEventHandlerContext } from './types'

export const createTaskFeaturesMouseMoveHandler = (context: TaskFeaturesEventHandlerContext) => {
  const { map, layersRef, currentPopupRef } = context

  return (e: maplibregl.MapMouseEvent) => {
    if (!map.current || currentPopupRef.current) {
      if (map.current) {
        map.current.getCanvas().style.cursor = ''
      }
      return
    }

    const taskLayerIds = layersRef.current.filter((id) => !id.includes('-highlight'))
    if (taskLayerIds.length === 0) {
      map.current.getCanvas().style.cursor = ''
      return
    }

    const taskFeatures = map.current.queryRenderedFeatures(e.point, {
      layers: taskLayerIds,
    })

    if (taskFeatures.length > 0) {
      map.current.getCanvas().style.cursor = 'pointer'
    } else {
      map.current.getCanvas().style.cursor = ''
    }
  }
}
