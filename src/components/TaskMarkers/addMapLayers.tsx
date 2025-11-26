import { CLUSTER_CONFIG, LAYER_IDS } from './const'

/**
 * Add map layers for a specific source (supports chunked data)
 */
export const addMapLayers = (map: React.RefObject<maplibregl.Map | null>, chunkIds = LAYER_IDS) => {
  if (!map.current) return

  map.current.addLayer({
    id: chunkIds.clusters,
    type: 'circle',
    source: chunkIds.source,
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
  })

  map.current.addLayer({
    id: chunkIds.clusterCount,
    type: 'symbol',
    source: chunkIds.source,
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
  })

  map.current.addLayer({
    id: chunkIds.points,
    type: 'symbol',
    source: chunkIds.source,
    filter: ['!', ['has', 'point_count']],
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
          'case',
          ['==', ['get', 'status'], 0],
          'marker-pin-0',
          ['==', ['get', 'status'], 1],
          'marker-pin-1',
          ['==', ['get', 'status'], 2],
          'marker-pin-2',
          ['==', ['get', 'status'], 3],
          'marker-pin-3',
          ['==', ['get', 'status'], 4],
          'marker-pin-4',
          ['==', ['get', 'status'], 5],
          'marker-pin-5',
          ['==', ['get', 'status'], 6],
          'marker-pin-6',
          'marker-pin-0',
        ],
      ],
      'icon-size': ['case', ['get', 'isHighlighted'], 1.4, ['get', 'isOverlapping'], 1.0, 0.8],
      'icon-anchor': 'bottom',
      'icon-allow-overlap': true,
      'symbol-sort-key': ['case', ['get', 'isHighlighted'], 1000, 0],
    },
  })

  map.current.addLayer({
    id: `${chunkIds.points}-highlight`,
    type: 'circle',
    source: chunkIds.source,
    filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'isHighlighted'], true]],
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
