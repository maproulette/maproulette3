import type maplibregl from 'maplibre-gl'
import { CLUSTER_CONFIG, LAYER_IDS } from './const'

export interface LayerIdsConfig {
  source: string
  clusters: string
  clusterCount: string
  points: string
}

export interface AddMapLayersOptions {
  /** Custom layer IDs configuration. Defaults to LAYER_IDS from const.tsx */
  layerIds?: LayerIdsConfig
  /** Whether to use 'taskCount' filter for clusters (server-side clustering). Defaults to false */
  useTaskCountFilter?: boolean
  /** Whether client-side clustering is enabled. When true, uses 'point_count' instead of 'taskCount'. Defaults to false */
  clientSideClustering?: boolean
  /** Whether clustering is enabled. When false, cluster layers won't be added. Defaults to true */
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

    // Check if clusterCount is already after clusters (higher index = renders on top)
    if (clusterCountIndex > clusterIndex) {
      // Already correct - clusterCount is after clusters, so it renders on top
      return
    }

    // ClusterCount is before clusters - need to move it after clusters
    // Find what comes after clusters in the layer list
    if (clusterIndex < layers.length - 1) {
      // There's a layer after clusters - move clusterCount to be before that layer
      const afterClusterLayerId = layers[clusterIndex + 1].id
      map.moveLayer(layerIds.clusterCount, afterClusterLayerId)
    } else {
      // Clusters is the last layer - move clusterCount to the end (top)
      map.moveLayer(layerIds.clusterCount)
    }
  } catch {
    // Ignore errors - layers might not be ready yet
  }
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

  // Remove cluster layers if clustering is disabled
  if (!clusteringEnabled) {
    if (map.current.getLayer(layerIds.clusters)) {
      map.current.removeLayer(layerIds.clusters)
    }
    if (map.current.getLayer(layerIds.clusterCount)) {
      map.current.removeLayer(layerIds.clusterCount)
    }
  }

  // Cluster filter - when client-side clustering is enabled on server clusters,
  // we need to show clusters with either 'point_count' (from MapLibre) or 'taskCount' (from server)
  // Otherwise use 'taskCount' for server-side clusters or 'point_count' for raw markers
  const clusterFilter =
    clientSideClustering && useTaskCountFilter
      ? // Show clusters that have either point_count OR taskCount
        // biome-ignore lint/suspicious/noExplicitAny: Mapbox filter types are too strict
        (['any', ['has', 'point_count'], ['has', 'taskCount']] as any)
      : clientSideClustering
        ? // biome-ignore lint/suspicious/noExplicitAny: Mapbox filter types are too strict
          (['has', 'point_count'] as any)
        : useTaskCountFilter
          ? // biome-ignore lint/suspicious/noExplicitAny: Mapbox filter types are too strict
            (['has', 'taskCount'] as any)
          : // biome-ignore lint/suspicious/noExplicitAny: Mapbox filter types are too strict
            (['has', 'point_count'] as any)

  // For cluster count, prioritize taskCount (aggregated from clusterProperties) over point_count
  // When client-side clustering is enabled on server clusters, MapLibre will:
  // - Create clusters with point_count (number of points clustered)
  // - Aggregate taskCount using clusterProperties (sum of all taskCount values)
  // We want to use taskCount when available since it represents actual task count
  const clusterCountExpression =
    clientSideClustering && useTaskCountFilter
      ? // Prefer aggregated taskCount (from clusterProperties), fallback to point_count
        // biome-ignore lint/suspicious/noExplicitAny: Mapbox expression types are too strict
        (['coalesce', ['get', 'taskCount'], ['get', 'point_count']] as any)
      : clientSideClustering
        ? // biome-ignore lint/suspicious/noExplicitAny: Mapbox expression types are too strict
          (['get', 'point_count'] as any)
        : useTaskCountFilter
          ? // biome-ignore lint/suspicious/noExplicitAny: Mapbox expression types are too strict
            (['get', 'taskCount'] as any)
          : // biome-ignore lint/suspicious/noExplicitAny: Mapbox expression types are too strict
            (['get', 'point_count'] as any)

  // Add clusters layer (only if clustering is enabled)
  if (clusteringEnabled && !map.current.getLayer(layerIds.clusters)) {
    try {
      console.log('addMapLayers: Adding clusters layer', {
        layerId: layerIds.clusters,
        filter: clusterFilter,
        useTaskCountFilter,
        clientSideClustering,
      })
      map.current.addLayer({
        id: layerIds.clusters,
        type: 'circle',
        source: layerIds.source,
        filter: clusterFilter,
        paint: {
          'circle-color': [
            'step',
            clusterCountExpression,
            CLUSTER_CONFIG.colors[0],
            CLUSTER_CONFIG.steps[0],
            CLUSTER_CONFIG.colors[1],
            CLUSTER_CONFIG.steps[1],
            CLUSTER_CONFIG.colors[2],
          ],
          'circle-radius': [
            'step',
            clusterCountExpression,
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
    } catch (_error) {
      // Silently handle - layer might already exist or map not ready
    }
  }

  // Add cluster count labels - must be above the cluster circle layer (only if clustering is enabled)
  if (clusteringEnabled && !map.current.getLayer(layerIds.clusterCount)) {
    try {
      // Find the layer that should come after cluster count (points layer or undefined for top)
      const pointsLayer = map.current.getLayer(layerIds.points)
      const beforeLayerId = pointsLayer ? layerIds.points : undefined

      map.current.addLayer(
        {
          id: layerIds.clusterCount,
          type: 'symbol',
          source: layerIds.source,
          filter: clusterFilter,
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
    } catch (_error) {
      // Silently handle - layer might already exist or map not ready
    }
  }

  // Add unclustered points layer
  // For server-side clustering, points are features without taskCount
  // For client-side clustering, points are features without point_count
  if (!map.current.getLayer(layerIds.points)) {
    try {
      map.current.addLayer({
        id: layerIds.points,
        type: 'symbol',
        source: layerIds.source,
        filter:
          clientSideClustering && useTaskCountFilter
            ? // Exclude features that have either point_count OR taskCount (i.e., show only unclustered points)
              // biome-ignore lint/suspicious/noExplicitAny: Mapbox filter types are too strict
              (['all', ['!', ['has', 'point_count']], ['!', ['has', 'taskCount']]] as any)
            : clientSideClustering
              ? // biome-ignore lint/suspicious/noExplicitAny: Mapbox filter types are too strict
                (['!', ['has', 'point_count']] as any)
              : useTaskCountFilter
                ? // biome-ignore lint/suspicious/noExplicitAny: Mapbox filter types are too strict
                  (['!', ['has', 'taskCount']] as any)
                : // biome-ignore lint/suspicious/noExplicitAny: Mapbox filter types are too strict
                  (['!', ['has', 'point_count']] as any),
        layout: {
          'icon-image': [
            'case',
            ['get', 'isOverlapping'],
            // Overlapping markers logic
            [
              'case',
              ['<=', ['get', 'overlapTaskCount'], 20],
              ['concat', 'marker-overlap-', ['to-string', ['get', 'overlapTaskCount']]],
              'marker-overlap-many',
            ],

            // Regular marker logic

            // Normal marker
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

            // Overlapping
            ['get', 'isOverlapping'],
            1.0,
            // Normal
            1.0,
          ],
          'icon-anchor': 'bottom',
          'icon-allow-overlap': true,
          'symbol-sort-key': 0,
        },
      })
    } catch (_error) {
      // Silently handle - layer might already exist or map not ready
    }
  }

  // Ensure cluster count is always above cluster circle (fixes ordering issues) - only if clustering is enabled
  if (clusteringEnabled) {
    ensureClusterCountAboveClusters(map.current, layerIds)
  }
}

// Re-export for backward compatibility
export { LAYER_IDS, CLUSTER_CONFIG }
