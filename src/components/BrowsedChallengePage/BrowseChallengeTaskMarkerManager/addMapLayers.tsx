import type maplibregl from 'maplibre-gl'
import type { ExpressionSpecification, FilterSpecification } from 'maplibre-gl'
import { CLUSTER_CONFIG, LAYER_IDS } from './const'

export interface LayerIdsConfig {
  source: string
  clusters: string
  clusterCount: string
  points: string
}

export interface AddMapLayersOptions {
  layerIds?: LayerIdsConfig
  useTaskCountFilter?: boolean
  clientSideClustering?: boolean
  clusteringEnabled?: boolean
}

/**
 * Ensures cluster count text layer is always above cluster circle layer
 * This fixes issues where OSM layers or other operations might reorder them
 *
 * In MapLibre, layers render from bottom to top (first in list = bottom, last = top)
 * moveLayer(layerId, beforeLayerId) moves layerId to be BEFORE beforeLayerId in the list
 * So to make clusterCount render ON TOP of clusters, we need clusterCount to be AFTER clusters in the list
 * This means we need to move clusterCount to be before whatever comes AFTER clusters
 */
export const ensureClusterCountAboveClusters = (
  map: maplibregl.Map,
  layerIds: LayerIdsConfig = LAYER_IDS
): void => {
  const clusterLayer = map.getLayer(layerIds.clusters)
  const clusterCountLayer = map.getLayer(layerIds.clusterCount)

  if (!clusterLayer || !clusterCountLayer) return

  try {
    const style = map.getStyle()
    const layers = style.layers || []
    const clusterIndex = layers.findIndex((l) => l.id === layerIds.clusters)
    const clusterCountIndex = layers.findIndex((l) => l.id === layerIds.clusterCount)

    if (clusterIndex < 0 || clusterCountIndex < 0) return

    if (clusterCountIndex > clusterIndex) {
      return
    }

    if (clusterIndex < layers.length - 1) {
      const afterClusterLayerId = layers[clusterIndex + 1].id
      map.moveLayer(layerIds.clusterCount, afterClusterLayerId)
    } else {
      map.moveLayer(layerIds.clusterCount)
    }
  } catch {}
}

/**
 * Add map layers for task markers
 */
export const addMapLayers = (
  map: React.RefObject<maplibregl.Map | null>,
  options: AddMapLayersOptions = {}
) => {
  if (!map.current) return

  const {
    layerIds = LAYER_IDS,
    useTaskCountFilter = false,
    clientSideClustering = false,
    clusteringEnabled = true,
  } = options

  if (!clusteringEnabled) {
    if (map.current.getLayer(layerIds.clusters)) {
      map.current.removeLayer(layerIds.clusters)
    }
    if (map.current.getLayer(layerIds.clusterCount)) {
      map.current.removeLayer(layerIds.clusterCount)
    }
  }

  const clusterFilter =
    clientSideClustering && useTaskCountFilter
      ? ['any', ['has', 'point_count'], ['has', 'taskCount']]
      : clientSideClustering
        ? ['has', 'point_count']
        : useTaskCountFilter
          ? ['has', 'taskCount']
          : ['has', 'point_count']

  const clusterCountExpression =
    clientSideClustering && useTaskCountFilter
      ? ['coalesce', ['get', 'taskCount'], ['get', 'point_count']]
      : clientSideClustering
        ? ['get', 'point_count']
        : useTaskCountFilter
          ? ['get', 'taskCount']
          : ['get', 'point_count']

  if (clusteringEnabled && !map.current.getLayer(layerIds.clusters)) {
    try {
      map.current.addLayer({
        id: layerIds.clusters,
        type: 'circle',
        source: layerIds.source,
        filter: clusterFilter as FilterSpecification,
        paint: {
          'circle-color': [
            'step',
            clusterCountExpression as number | ExpressionSpecification,
            CLUSTER_CONFIG.colors[0],
            CLUSTER_CONFIG.steps[0],
            CLUSTER_CONFIG.colors[1],
            CLUSTER_CONFIG.steps[1],
            CLUSTER_CONFIG.colors[2],
          ],
          'circle-radius': [
            'step',
            clusterCountExpression as number | ExpressionSpecification,
            CLUSTER_CONFIG.sizes[0],
            CLUSTER_CONFIG.steps[0],
            CLUSTER_CONFIG.sizes[1],
            CLUSTER_CONFIG.steps[1],
            CLUSTER_CONFIG.sizes[2],
          ],
          'circle-stroke-width': 0,
          'circle-opacity': 0.9,
        },
      })
    } catch (_error) {}
  }

  if (clusteringEnabled && !map.current.getLayer(layerIds.clusterCount)) {
    try {
      const pointsLayer = map.current.getLayer(layerIds.points)
      const beforeLayerId = pointsLayer ? layerIds.points : undefined

      map.current.addLayer(
        {
          id: layerIds.clusterCount,
          type: 'symbol',
          source: layerIds.source,
          filter: clusterFilter as FilterSpecification,
          layout: {
            'text-field': ['to-string', clusterCountExpression],
            'text-font': ['Noto Sans Regular', 'Open Sans Regular', 'Arial Unicode MS Regular'],
            'text-size': 14,
            'text-anchor': 'center',
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': '#000000',
            'text-halo-width': 1,
          },
        },
        beforeLayerId
      )
    } catch (_error) {}
  }

  if (!map.current.getLayer(layerIds.points)) {
    try {
      map.current.addLayer({
        id: layerIds.points,
        type: 'symbol',
        source: layerIds.source,
        filter:
          clientSideClustering && useTaskCountFilter
            ? ['all', ['!', ['has', 'point_count']], ['!', ['has', 'taskCount']]]
            : clientSideClustering
              ? ['!', ['has', 'point_count']]
              : useTaskCountFilter
                ? ['!', ['has', 'taskCount']]
                : ['!', ['has', 'point_count']],
        layout: {
          'icon-image': [
            'case',
            ['get', 'isOverlapping'],

            [
              'case',
              ['<=', ['get', 'overlapTaskCount'], 20],
              ['concat', 'marker-overlap-', ['to-string', ['get', 'overlapTaskCount']]],
              'marker-overlap-many',
            ],

            [
              'concat',
              'marker-pin-',
              ['to-string', ['get', 'status']],
              '-',
              ['to-string', ['coalesce', ['get', 'difficulty'], 1]],
            ],
          ],
          'icon-size': [
            'case',

            ['get', 'isOverlapping'],
            1.0,

            1.0,
          ],
          'icon-anchor': 'bottom',
          'icon-allow-overlap': true,
          'symbol-sort-key': 0,
        },
      })
    } catch (_error) {}
  }

  if (clusteringEnabled) {
    ensureClusterCountAboveClusters(map.current, layerIds)
  }
}
