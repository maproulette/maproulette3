import type maplibregl from 'maplibre-gl'

const TASK_FEATURE_LAYER_IDS = [
  'task-geometries-fill',
  'task-geometries-line',
  'task-geometries-outline',
  'task-geometries-point',
] as const

/**
 * Finds the first existing task feature layer (geometries)
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
 * Finds the target layer ID for positioning task features layers based on dataLayerOrder
 */
export const findTargetLayerId = (
  map: maplibregl.Map,
  dataLayerOrder: ('task-features' | 'osm-data')[]
): string | undefined => {
  const taskFeaturesShouldBeOnTop =
    dataLayerOrder.indexOf('task-features') < dataLayerOrder.indexOf('osm-data')

  if (taskFeaturesShouldBeOnTop) {
    // Task features should be on top - find what comes after task geometries
    const style = map.getStyle()
    const layers = style.layers || []

    // Check in reverse order to find the last task feature layer
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

    // If no task feature layers, return undefined to add at top
    return undefined
  } else {
    // Task features should be below - insert before task geometries
    const beforeLayer = findFirstTaskFeatureLayer(map)
    if (beforeLayer) return beforeLayer
  }

  return undefined
}

/**
 * Repositions existing task features layers based on dataLayerOrder
 */
export const repositionTaskFeaturesLayers = (
  map: maplibregl.Map,
  existingLayers: string[],
  dataLayerOrder: ('task-features' | 'osm-data')[]
): void => {
  const taskFeaturesShouldBeOnTop =
    dataLayerOrder.indexOf('task-features') < dataLayerOrder.indexOf('osm-data')

  if (taskFeaturesShouldBeOnTop) {
    // Task features should be on top - move all layers to the top
    // Move in reverse order to maintain relative order, and move to undefined (top)
    existingLayers.reverse().forEach((layerId) => {
      if (map.getLayer(layerId)) {
        try {
          // Move to top by not specifying a beforeId
          const style = map.getStyle()
          const layers = style.layers || []
          const currentIndex = layers.findIndex((l) => l.id === layerId)

          // Only move if not already at or near the top
          if (currentIndex >= 0 && currentIndex < layers.length - 5) {
            map.moveLayer(layerId)
          }
        } catch (error) {
          console.warn(`Error moving layer ${layerId} to top:`, error)
        }
      }
    })
  } else {
    // Task features should be below - use the target layer approach
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
}
