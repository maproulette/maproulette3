import { LAYER_IDS } from './const'

export const addMapLayers = (map: React.RefObject<maplibregl.Map | null>) => {
  if (!map.current) return

  map.current.addLayer({
    id: LAYER_IDS.clusters,
    type: 'circle',
    source: LAYER_IDS.source,
    filter: ['has', 'taskCount'],
    paint: {
      'circle-color': ['step', ['get', 'taskCount'], '#22c55e', 30, '#eab308', 70, '#f97316'],
      'circle-radius': ['step', ['get', 'taskCount'], 20, 30, 25, 70, 30],
      'circle-stroke-width': 0,
      'circle-opacity': 0.9,
    },
  })

  map.current.addLayer({
    id: LAYER_IDS.clusterCount,
    type: 'symbol',
    source: LAYER_IDS.source,
    filter: ['has', 'taskCount'],
    layout: {
      'text-field': ['to-string', ['get', 'taskCount']],
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
    id: LAYER_IDS.points,
    type: 'symbol',
    source: LAYER_IDS.source,
    filter: ['!', ['has', 'taskCount']],
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
      'icon-size': ['case', ['get', 'isOverlapping'], 1.0, 0.8],
      'icon-anchor': 'bottom',
      'icon-allow-overlap': true,
    },
  })
}
