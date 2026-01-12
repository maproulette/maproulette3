import type maplibregl from 'maplibre-gl'

const TASK_FEATURE_LAYER_IDS = [
  'task-geometries-fill',
  'task-geometries-line',
  'task-geometries-outline',
  'task-geometries-point',
] as const

const TASK_MARKER_LAYER_ID = 'task-unclustered-point'

/**
 * Finds the first existing task feature layer
 */
const findFirstTaskFeatureLayer = (map: maplibregl.Map): string | undefined => {
  for (const layerId of TASK_FEATURE_LAYER_IDS) {
    if (map.getLayer(layerId)) {
      return layerId
    }
  }
  return undefined
}

/**
 * Finds the layer that comes after the last task feature layer
 */
const findAfterLastTaskFeatureLayer = (map: maplibregl.Map): string | undefined => {
  const style = map.getStyle()
  const layers = style.layers || []

  // Check in reverse order to find the last one
  for (let i = TASK_FEATURE_LAYER_IDS.length - 1; i >= 0; i--) {
    const layerId = TASK_FEATURE_LAYER_IDS[i]
    const layer = map.getLayer(layerId)
    if (layer) {
      const layerIndex = layers.findIndex((l) => l.id === layerId)
      if (layerIndex >= 0 && layerIndex < layers.length - 1) {
        return layers[layerIndex + 1].id
      }
    }
  }
  return undefined
}

/**
 * Finds the target layer ID for positioning OSM layers based on dataLayerOrder
 */
export const findTargetLayerId = (
  map: maplibregl.Map,
  dataLayerOrder: ('task-features' | 'osm-data')[]
): string | undefined => {
  const osmShouldBeOnTop =
    dataLayerOrder.indexOf('osm-data') < dataLayerOrder.indexOf('task-features')

  if (osmShouldBeOnTop) {
    // OSM should be on top - find what comes after task features
    const afterLayer = findAfterLastTaskFeatureLayer(map)
    if (afterLayer) return afterLayer

    // If no task features, check task markers
    const taskMarkerLayer = map.getLayer(TASK_MARKER_LAYER_ID)
    if (taskMarkerLayer) {
      const style = map.getStyle()
      const layers = style.layers || []
      const layerIndex = layers.findIndex((l) => l.id === TASK_MARKER_LAYER_ID)
      if (layerIndex >= 0 && layerIndex < layers.length - 1) {
        return layers[layerIndex + 1].id
      }
    }
  } else {
    // OSM should be below - insert before task features
    const beforeLayer = findFirstTaskFeatureLayer(map)
    if (beforeLayer) return beforeLayer

    // If no task features, insert before task markers
    if (map.getLayer(TASK_MARKER_LAYER_ID)) {
      return TASK_MARKER_LAYER_ID
    }
  }

  return undefined
}

/**
 * Repositions existing OSM layers based on dataLayerOrder
 */
export const repositionOSMLayers = (
  map: maplibregl.Map,
  existingLayers: string[],
  dataLayerOrder: ('task-features' | 'osm-data')[]
): void => {
  const targetBeforeLayerId = findTargetLayerId(map, dataLayerOrder)

  if (targetBeforeLayerId) {
    // Move in reverse order to maintain relative order
    existingLayers.reverse().forEach((layerId) => {
      if (map.getLayer(layerId)) {
        try {
          map.moveLayer(layerId, targetBeforeLayerId)
        } catch {
          // Ignore errors
        }
      }
    })
  }
}
