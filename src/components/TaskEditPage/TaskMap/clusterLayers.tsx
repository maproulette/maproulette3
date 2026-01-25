import type { LayerProps } from 'react-map-gl/maplibre'
import { CLUSTER_CONFIG, LAYER_IDS } from '@/components/shared/TaskMarkers/const'

export const clusterLayer: LayerProps = {
  id: LAYER_IDS.clusters,
  type: 'circle',
  source: LAYER_IDS.source,
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': [
      'step',
      ['get', 'point_count'],
      CLUSTER_CONFIG.colors[0],
      CLUSTER_CONFIG.steps[0],
      CLUSTER_CONFIG.colors[1],
      CLUSTER_CONFIG.steps[1],
      CLUSTER_CONFIG.colors[2],
    ],
    'circle-radius': [
      'step',
      ['get', 'point_count'],
      CLUSTER_CONFIG.sizes[0],
      CLUSTER_CONFIG.steps[0],
      CLUSTER_CONFIG.sizes[1],
      CLUSTER_CONFIG.steps[1],
      CLUSTER_CONFIG.sizes[2],
    ],
    'circle-stroke-width': 0,
    'circle-opacity': 0.9,
  },
}

export const clusterCountLayer: LayerProps = {
  id: LAYER_IDS.clusterCount,
  type: 'symbol',
  source: LAYER_IDS.source,
  filter: ['has', 'point_count'],
  layout: {
    'text-field': ['to-string', ['get', 'point_count']],
    'text-font': ['Noto Sans Regular', 'Open Sans Regular', 'Arial Unicode MS Regular'],
    'text-size': 14,
    'text-anchor': 'center',
  },
  paint: {
    'text-color': '#ffffff',
    'text-halo-color': '#000000',
    'text-halo-width': 1,
  },
}

export const unclusteredPointLayer: LayerProps = {
  id: LAYER_IDS.points,
  type: 'symbol',
  source: LAYER_IDS.source,
  filter: ['!', ['has', 'point_count']],
  minzoom: 2, // Hide markers at very low zoom levels to improve performance
  maxzoom: 24,
  layout: {
    'icon-image': [
      'case',
      ['get', 'isOverlapping'],
      // Overlapping markers logic - priority order: bundled+selected (dual) > bundled (green) > selected (purple) > lasso (yellow) > normal
      [
        'case',
        // Bundled AND selected overlap marker (dual border: purple outer, green inner)
        ['all', ['get', 'isHighlighted'], ['get', 'isSelected']],
        [
          'case',
          ['<=', ['get', 'overlapTaskCount'], 20],
          ['concat', 'marker-overlap-', ['to-string', ['get', 'overlapTaskCount']], '-bundled-selected'],
          'marker-overlap-many-bundled-selected',
        ],
        // Bundled overlap marker (green border)
        ['get', 'isHighlighted'],
        [
          'case',
          ['<=', ['get', 'overlapTaskCount'], 20],
          ['concat', 'marker-overlap-', ['to-string', ['get', 'overlapTaskCount']], '-bundled'],
          'marker-overlap-many-bundled',
        ],
        // Lasso AND selected overlap marker (dual border: purple outer, yellow inner)
        ['all', ['get', 'isLassoSelected'], ['get', 'isSelected']],
        [
          'case',
          ['<=', ['get', 'overlapTaskCount'], 20],
          ['concat', 'marker-overlap-', ['to-string', ['get', 'overlapTaskCount']], '-lasso-selected'],
          'marker-overlap-many-lasso-selected',
        ],
        // Popup selected overlap marker (purple border)
        ['get', 'isSelected'],
        [
          'case',
          ['<=', ['get', 'overlapTaskCount'], 20],
          ['concat', 'marker-overlap-', ['to-string', ['get', 'overlapTaskCount']], '-selected'],
          'marker-overlap-many-selected',
        ],
        // Lasso selected overlap marker (yellow border)
        ['get', 'isLassoSelected'],
        [
          'case',
          ['<=', ['get', 'overlapTaskCount'], 20],
          ['concat', 'marker-overlap-', ['to-string', ['get', 'overlapTaskCount']], '-lasso'],
          'marker-overlap-many-lasso',
        ],
        // Hovered overlap marker (green border)
        ['get', 'isHovered'],
        [
          'case',
          ['<=', ['get', 'overlapTaskCount'], 20],
          ['concat', 'marker-overlap-', ['to-string', ['get', 'overlapTaskCount']], '-bundled'],
          'marker-overlap-many-bundled',
        ],
        // Normal overlap marker
        [
          'case',
          ['<=', ['get', 'overlapTaskCount'], 20],
          ['concat', 'marker-overlap-', ['to-string', ['get', 'overlapTaskCount']]],
          'marker-overlap-many',
        ],
      ],
      // Regular marker logic - priority order: bundled+selected (dual) > bundled (green) > selected (purple) > lasso (yellow) > normal
      [
        'case',
        // Bundled AND selected marker (dual border: purple outer, green inner)
        ['all', ['get', 'isHighlighted'], ['get', 'isSelected']],
        [
          'concat',
          'marker-pin-',
          ['to-string', ['get', 'status']],
          '-',
          ['to-string', ['coalesce', ['get', 'difficulty'], 1]],
          '-bundled-selected',
        ],
        // Bundled/primary task marker (green border)
        ['get', 'isHighlighted'],
        [
          'concat',
          'marker-pin-',
          ['to-string', ['get', 'status']],
          '-',
          ['to-string', ['coalesce', ['get', 'difficulty'], 1]],
          '-bundled',
        ],
        // Lasso AND selected marker (dual border: purple outer, yellow inner)
        ['all', ['get', 'isLassoSelected'], ['get', 'isSelected']],
        [
          'concat',
          'marker-pin-',
          ['to-string', ['get', 'status']],
          '-',
          ['to-string', ['coalesce', ['get', 'difficulty'], 1]],
          '-lasso-selected',
        ],
        // Popup selected marker (purple border)
        ['get', 'isSelected'],
        [
          'concat',
          'marker-pin-',
          ['to-string', ['get', 'status']],
          '-',
          ['to-string', ['coalesce', ['get', 'difficulty'], 1]],
          '-selected',
        ],
        // Lasso selected marker (yellow border)
        ['get', 'isLassoSelected'],
        [
          'concat',
          'marker-pin-',
          ['to-string', ['get', 'status']],
          '-',
          ['to-string', ['coalesce', ['get', 'difficulty'], 1]],
          '-lasso',
        ],
        // Hovered marker
        ['get', 'isHovered'],
        [
          'concat',
          'marker-pin-',
          ['to-string', ['get', 'status']],
          '-',
          ['to-string', ['coalesce', ['get', 'difficulty'], 1]],
          '-bundled',
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
      // Highlighted (bundled/primary) or popup selected - scale up
      ['any', ['get', 'isHighlighted'], ['get', 'isSelected']],
      1.4,
      // Hovered - scale up slightly
      ['get', 'isHovered'],
      1.2,
      // Overlapping
      ['get', 'isOverlapping'],
      1.0,
      // Normal (including lasso-selected)
      1.0,
    ],
    'icon-anchor': 'bottom',
    'icon-allow-overlap': true,
    'icon-ignore-placement': false, // Allow MapLibre to optimize placement
    'symbol-sort-key': [
      'case',
      // Bundled + selected gets highest priority
      ['all', ['get', 'isHighlighted'], ['get', 'isSelected']],
      1100,
      ['get', 'isHighlighted'],
      1000,
      // Lasso + selected
      ['all', ['get', 'isLassoSelected'], ['get', 'isSelected']],
      950,
      ['get', 'isSelected'],
      900,
      ['get', 'isLassoSelected'],
      850,
      ['get', 'isHovered'],
      800,
      0,
    ],
  },
}
