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
  /** Whether to include the highlight layer. Defaults to true */
  includeHighlight?: boolean
  /** Whether to use 'taskCount' filter for clusters (server-side clustering). Defaults to false */
  useTaskCountFilter?: boolean
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

  const { layerIds = LAYER_IDS, includeHighlight = true, useTaskCountFilter = false } = options

  // Cluster filter - either server-side 'taskCount' or client-side 'point_count'
  const clusterFilter = useTaskCountFilter
    ? // biome-ignore lint/suspicious/noExplicitAny: Mapbox filter types are too strict
      (['has', 'taskCount'] as any)
    : // biome-ignore lint/suspicious/noExplicitAny: Mapbox filter types are too strict
      (['has', 'point_count'] as any)
  const clusterCountProperty = useTaskCountFilter ? 'taskCount' : 'point_count'

  // Add clusters layer
  if (!map.current.getLayer(layerIds.clusters)) {
    try {
      map.current.addLayer({
        id: layerIds.clusters,
        type: 'circle',
        source: layerIds.source,
        filter: clusterFilter,
        paint: {
          'circle-color': [
            'step',
            ['get', clusterCountProperty],
            CLUSTER_CONFIG.colors[0],
            CLUSTER_CONFIG.steps[0],
            CLUSTER_CONFIG.colors[1],
            CLUSTER_CONFIG.steps[1],
            CLUSTER_CONFIG.colors[2],
          ],
          'circle-radius': [
            'step',
            ['get', clusterCountProperty],
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
    } catch (error) {
      // Silently handle - layer might already exist or map not ready
    }
  }

  // Add cluster count labels - must be above the cluster circle layer
  if (!map.current.getLayer(layerIds.clusterCount)) {
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
            'text-field': ['to-string', ['get', clusterCountProperty]],
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
    } catch (error) {
      // Silently handle - layer might already exist or map not ready
    }
  }

  // Add unclustered points layer
  if (!map.current.getLayer(layerIds.points)) {
    try {
      map.current.addLayer({
        id: layerIds.points,
        type: 'symbol',
        source: layerIds.source,
        // biome-ignore lint/suspicious/noExplicitAny: Mapbox filter types are too strict
        filter: ['!', clusterFilter] as any,
        layout: {
          'icon-image': [
            'case',
            ['get', 'isOverlapping'],
            // Overlapping markers logic
            [
              'case',
              // Selected overlap marker
              ['get', 'isSelected'],
              [
                'case',
                ['<=', ['get', 'overlapTaskCount'], 20],
                [
                  'concat',
                  'marker-overlap-',
                  ['to-string', ['get', 'overlapTaskCount']],
                  '-selected',
                ],
                'marker-overlap-many-selected',
              ],
              // Hovered overlap marker
              ['get', 'isHovered'],
              [
                'case',
                ['<=', ['get', 'overlapTaskCount'], 20],
                [
                  'concat',
                  'marker-overlap-',
                  ['to-string', ['get', 'overlapTaskCount']],
                  '-hovered',
                ],
                'marker-overlap-many-hovered',
              ],
              // Normal overlap marker
              [
                'case',
                ['<=', ['get', 'overlapTaskCount'], 20],
                ['concat', 'marker-overlap-', ['to-string', ['get', 'overlapTaskCount']]],
                'marker-overlap-many',
              ],
            ],

            // Regular marker logic
            [
              'case',
              // Selected marker
              ['get', 'isSelected'],
              [
                'concat',
                'marker-pin-',
                ['to-string', ['get', 'status']],
                '-',
                ['to-string', ['coalesce', ['get', 'difficulty'], 1]],
                '-selected',
              ],
              // Hovered marker
              ['get', 'isHovered'],
              [
                'concat',
                'marker-pin-',
                ['to-string', ['get', 'status']],
                '-',
                ['to-string', ['coalesce', ['get', 'difficulty'], 1]],
                '-hovered',
              ],
              // Normal marker
              [
                'concat',
                'marker-pin-',
                ['to-string', ['get', 'status']],
                '-',
                ['to-string', ['coalesce', ['get', 'difficulty'], 1]],
              ],
            ],
          ],
          'icon-size': [
            'case',
            // Highlighted or selected - scale up
            ['any', ['get', 'isHighlighted'], ['get', 'isSelected']],
            1.4,
            // Hovered - scale up slightly
            ['get', 'isHovered'],
            1.2,
            // Overlapping
            ['get', 'isOverlapping'],
            1.0,
            // Normal
            1.0,
          ],
          'icon-anchor': 'bottom',
          'icon-allow-overlap': true,
          'symbol-sort-key': [
            'case',
            ['get', 'isHighlighted'],
            1000,
            ['get', 'isSelected'],
            900,
            ['get', 'isHovered'],
            800,
            0,
          ],
        },
      })
    } catch (error) {
      // Silently handle - layer might already exist or map not ready
    }
  }

  // Ensure cluster count is always above cluster circle (fixes ordering issues)
  ensureClusterCountAboveClusters(map.current, layerIds)

  // Add highlight layer if requested
  if (includeHighlight) {
    const highlightLayerId = `${layerIds.points}-highlight`
    if (!map.current.getLayer(highlightLayerId)) {
      try {
        map.current.addLayer({
          id: highlightLayerId,
          type: 'circle',
          source: layerIds.source,
          // biome-ignore lint/suspicious/noExplicitAny: Mapbox filter types are too strict
          filter: ['all', ['!', clusterFilter], ['==', ['get', 'isHighlighted'], true]] as any,
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 8, 18, 20],
            'circle-color': '#eab308',
            'circle-opacity': 0.3,
            'circle-stroke-width': 3,
            'circle-stroke-color': '#eab308',
            'circle-stroke-opacity': 0.8,
          },
        })
      } catch (error) {
        // Silently handle - layer might already exist or map not ready
      }
    }
  }
}

// Re-export for backward compatibility
export { LAYER_IDS, CLUSTER_CONFIG }

