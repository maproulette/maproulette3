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

  // Add cluster count labels
  map.current.addLayer({
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
  })

  // Add unclustered points layer
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
            ['concat', 'marker-overlap-', ['to-string', ['get', 'overlapTaskCount']], '-selected'],
            'marker-overlap-many-selected',
          ],
          // Hovered overlap marker
          ['get', 'isHovered'],
          [
            'case',
            ['<=', ['get', 'overlapTaskCount'], 20],
            ['concat', 'marker-overlap-', ['to-string', ['get', 'overlapTaskCount']], '-hovered'],
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
        ['any', ['get', 'isHighlighted'], ['get', 'isSelected']],
        1.4,
        ['get', 'isOverlapping'],
        1.0,
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

  // Add highlight layer if requested
  if (includeHighlight) {
    map.current.addLayer({
      id: `${layerIds.points}-highlight`,
      type: 'circle',
      source: layerIds.source,
      // biome-ignore lint/suspicious/noExplicitAny: Mapbox filter types are too strict
      filter: ['all', ['!', clusterFilter], ['==', ['get', 'isHighlighted'], true]] as any,
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 8, 18, 20],
        'circle-color': '#3b82f6',
        'circle-opacity': 0.3,
        'circle-stroke-width': 3,
        'circle-stroke-color': '#3b82f6',
        'circle-stroke-opacity': 0.8,
      },
    })
  }
}
