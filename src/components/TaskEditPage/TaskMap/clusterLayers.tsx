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
  minzoom: 2,
  maxzoom: 24,
  layout: {
    'icon-image': [
      'case',
      // Overlapping markers - use overlap icons based on task count
      ['==', ['get', 'isOverlapping'], true],
      [
        'case',
        // Bundled AND active/selected overlap marker (dual border: purple outer, green inner)
        ['all', ['==', ['get', 'isHighlighted'], true], ['any', ['==', ['get', 'isActive'], true], ['==', ['get', 'isSelected'], true]]],
        [
          'case',
          ['>', ['get', 'overlapTaskCount'], 20],
          'marker-overlap-many-bundled-selected',
          [
            'concat',
            'marker-overlap-',
            ['to-string', ['get', 'overlapTaskCount']],
            '-bundled-selected',
          ],
        ],
        // Bundled/primary overlap marker (green border)
        ['==', ['get', 'isHighlighted'], true],
        [
          'case',
          ['>', ['get', 'overlapTaskCount'], 20],
          'marker-overlap-many-bundled',
          ['concat', 'marker-overlap-', ['to-string', ['get', 'overlapTaskCount']], '-bundled'],
        ],
        // Lasso AND active/selected overlap marker (dual border: purple outer, yellow inner)
        ['all', ['==', ['get', 'isLassoSelected'], true], ['any', ['==', ['get', 'isActive'], true], ['==', ['get', 'isSelected'], true]]],
        [
          'case',
          ['>', ['get', 'overlapTaskCount'], 20],
          'marker-overlap-many-lasso-selected',
          [
            'concat',
            'marker-overlap-',
            ['to-string', ['get', 'overlapTaskCount']],
            '-lasso-selected',
          ],
        ],
        // Active/selected overlap marker (purple border)
        ['any', ['==', ['get', 'isActive'], true], ['==', ['get', 'isSelected'], true]],
        [
          'case',
          ['>', ['get', 'overlapTaskCount'], 20],
          'marker-overlap-many-selected',
          ['concat', 'marker-overlap-', ['to-string', ['get', 'overlapTaskCount']], '-selected'],
        ],
        // Lasso selected overlap marker (yellow border)
        ['==', ['get', 'isLassoSelected'], true],
        [
          'case',
          ['>', ['get', 'overlapTaskCount'], 20],
          'marker-overlap-many-lasso',
          ['concat', 'marker-overlap-', ['to-string', ['get', 'overlapTaskCount']], '-lasso'],
        ],
        // Normal overlap marker
        [
          'case',
          ['>', ['get', 'overlapTaskCount'], 20],
          'marker-overlap-many',
          ['concat', 'marker-overlap-', ['to-string', ['get', 'overlapTaskCount']]],
        ],
      ],
      // Regular task markers
      // Bundled AND active/selected marker (dual border: purple outer, green inner)
      ['all', ['==', ['get', 'isHighlighted'], true], ['any', ['==', ['get', 'isActive'], true], ['==', ['get', 'isSelected'], true]]],
      [
        'concat',
        'marker-pin-',
        ['to-string', ['get', 'status']],
        '-',
        ['to-string', ['coalesce', ['get', 'difficulty'], 1]],
        '-bundled-selected',
      ],
      // Bundled/primary task marker (green border)
      ['==', ['get', 'isHighlighted'], true],
      [
        'concat',
        'marker-pin-',
        ['to-string', ['get', 'status']],
        '-',
        ['to-string', ['coalesce', ['get', 'difficulty'], 1]],
        '-bundled',
      ],
      // Lasso AND active/selected marker (dual border: purple outer, yellow inner)
      ['all', ['==', ['get', 'isLassoSelected'], true], ['any', ['==', ['get', 'isActive'], true], ['==', ['get', 'isSelected'], true]]],
      [
        'concat',
        'marker-pin-',
        ['to-string', ['get', 'status']],
        '-',
        ['to-string', ['coalesce', ['get', 'difficulty'], 1]],
        '-lasso-selected',
      ],
      // Active/selected marker (purple border)
      ['any', ['==', ['get', 'isActive'], true], ['==', ['get', 'isSelected'], true]],
      [
        'concat',
        'marker-pin-',
        ['to-string', ['get', 'status']],
        '-',
        ['to-string', ['coalesce', ['get', 'difficulty'], 1]],
        '-selected',
      ],
      // Lasso selected marker (yellow border)
      ['==', ['get', 'isLassoSelected'], true],
      [
        'concat',
        'marker-pin-',
        ['to-string', ['get', 'status']],
        '-',
        ['to-string', ['coalesce', ['get', 'difficulty'], 1]],
        '-lasso',
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
    'icon-size': [
      'case',
      // Highlighted (bundled/primary) or active/selected - scale up
      ['any', ['==', ['get', 'isHighlighted'], true], ['==', ['get', 'isActive'], true], ['==', ['get', 'isSelected'], true]],
      1.4,
      // Normal (including lasso-selected)
      1.0,
    ],
    'icon-anchor': 'bottom',
    'icon-allow-overlap': true,
    'icon-ignore-placement': true,
    'symbol-sort-key': [
      'case',
      ['all', ['==', ['get', 'isHighlighted'], true], ['any', ['==', ['get', 'isActive'], true], ['==', ['get', 'isSelected'], true]]],
      1100,
      ['==', ['get', 'isHighlighted'], true],
      1000,
      ['all', ['==', ['get', 'isLassoSelected'], true], ['any', ['==', ['get', 'isActive'], true], ['==', ['get', 'isSelected'], true]]],
      950,
      ['any', ['==', ['get', 'isActive'], true], ['==', ['get', 'isSelected'], true]],
      900,
      ['==', ['get', 'isLassoSelected'], true],
      850,
      0,
    ],
  },
}
