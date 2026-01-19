import { LAYER_IDS } from '../const'
import { removeAllPopups } from './popupUtils'

/**
 * Remove all task marker layers and sources from the map
 */
export const cleanupLayers = (map: maplibregl.Map) => {
  if (map.getSource(LAYER_IDS.source)) {
    Object.values(LAYER_IDS).forEach((layerId: string) => {
      if (layerId !== LAYER_IDS.source && map.getLayer(layerId)) {
        map.removeLayer(layerId)
      }
    })
    map.removeSource(LAYER_IDS.source)
  }
}

/**
 * Remove all maplibre popups from the map and clean up React roots
 */
export const cleanupPopups = (map?: maplibregl.Map) => {
  if (map) {
    removeAllPopups(map)
  } else {
    const existingPopups = document.querySelectorAll('.maplibregl-popup')
    existingPopups.forEach((popup) => {
      popup.remove()
    })
  }
}
