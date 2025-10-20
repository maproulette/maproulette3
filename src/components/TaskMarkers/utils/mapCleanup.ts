import { LAYER_IDS } from '../const'

/**
 * Remove all task marker layers and sources from the map
 */
export const cleanupLayers = (map: maplibregl.Map) => {
  if (map.getSource(LAYER_IDS.source)) {
    // Remove highlight layer
    const highlightLayerId = `${LAYER_IDS.points}-highlight`
    if (map.getLayer(highlightLayerId)) {
      map.removeLayer(highlightLayerId)
    }
    
    // Remove all other layers
    Object.values(LAYER_IDS).forEach((layerId) => {
      if (layerId !== LAYER_IDS.source && map.getLayer(layerId)) {
        map.removeLayer(layerId)
      }
    })
    map.removeSource(LAYER_IDS.source)
  }
}

/**
 * Remove all maplibre popups from the DOM
 */
export const cleanupPopups = () => {
  const existingPopups = document.querySelectorAll('.maplibregl-popup')
  existingPopups.forEach((popup) => {
    popup.remove()
  })
}
