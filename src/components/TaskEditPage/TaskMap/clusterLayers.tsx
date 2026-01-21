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
    'icon-ignore-placement': false, // Allow MapLibre to optimize placement
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
}
