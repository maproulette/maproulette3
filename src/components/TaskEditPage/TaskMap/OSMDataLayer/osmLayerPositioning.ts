import type maplibregl from 'maplibre-gl'
import { ensureClusterCountAboveClusters } from '@/components/shared/TaskMarkers/addMapLayers'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'

const TASK_FEATURE_LAYER_IDS = [
  'task-geometries-fill',
  'task-geometries-line',
  'task-geometries-outline',
  'task-geometries-point',
] as const

const TASK_MARKER_LAYER_IDS = [
  LAYER_IDS.clusters,
  LAYER_IDS.clusterCount,
  LAYER_IDS.points,
] as const

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
    const afterLayer = findAfterLastTaskFeatureLayer(map)
    if (afterLayer) return afterLayer

    const style = map.getStyle()
    const layers = style.layers || []

    for (let i = TASK_MARKER_LAYER_IDS.length - 1; i >= 0; i--) {
      const layerId = TASK_MARKER_LAYER_IDS[i]
      const taskMarkerLayer = map.getLayer(layerId)
      if (taskMarkerLayer) {
        const layerIndex = layers.findIndex((l) => l.id === layerId)
        if (layerIndex >= 0 && layerIndex < layers.length - 1) {
          return layers[layerIndex + 1].id
        }
      }
    }
  } else {
    const beforeLayer = findFirstTaskFeatureLayer(map)
    if (beforeLayer) return beforeLayer

    for (const layerId of TASK_MARKER_LAYER_IDS) {
      if (map.getLayer(layerId)) {
        return layerId
      }
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
    existingLayers.reverse().forEach((layerId) => {
      if (map.getLayer(layerId)) {
        try {
          map.moveLayer(layerId, targetBeforeLayerId)
        } catch {}
      }
    })
  }

  setTimeout(() => {
    ensureClusterCountAboveClusters(map)
  }, 50)
}
