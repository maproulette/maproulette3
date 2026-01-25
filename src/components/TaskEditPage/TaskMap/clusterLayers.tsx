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

// TEMPORARY SIMPLIFIED VERSION FOR TESTING
// Using a fixed icon name to verify the layer works at all
export const unclusteredPointLayer: LayerProps = {
  id: LAYER_IDS.points,
  type: 'symbol',
  source: LAYER_IDS.source,
  filter: ['!', ['has', 'point_count']],
  minzoom: 2,
  maxzoom: 24,
  layout: {
    'icon-image': 'marker-pin-0-1',
    'icon-size': 1.0,
    'icon-anchor': 'bottom',
    'icon-allow-overlap': true,
  },
}
