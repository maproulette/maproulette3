import { LAYER_IDS } from './const'

export const addMapLayers = (map: React.RefObject<maplibregl.Map | null>) => {
  if (!map.current) return

  // Add MapLibre cluster circles (uses built-in 'cluster' property and point_count)
  map.current.addLayer({
    id: LAYER_IDS.clusters,
    type: 'circle',
    source: LAYER_IDS.source,
    filter: ['has', 'taskCount'], // MapLibre adds 'point_count' to clustered features
    paint: {
      'circle-color': [
        'step',
        ['get', 'taskCount'],
        '#22c55e', // green for small clusters
        30,
        '#eab308', // yellow for medium clusters
        70,
        '#f97316', // orange for large clusters
      ],
      'circle-radius': [
        'step',
        ['get', 'taskCount'],
        20, // small radius
        30,
        25, // medium radius
        70,
        30, // large radius
      ],
      'circle-stroke-width': 0,
      'circle-opacity': 0.9,
    },
  })

  // Add cluster count text (MapLibre uses point_count)
  map.current.addLayer({
    id: LAYER_IDS.clusterCount,
    type: 'symbol',
    source: LAYER_IDS.source,
    filter: ['has', 'taskCount'], // Only show on clustered features
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

  // Add individual points layer (non-clustered features)
  map.current.addLayer({
    id: LAYER_IDS.points,
    type: 'symbol',
    source: LAYER_IDS.source,
    filter: ['!', ['has', 'taskCount']], // Show only non-clustered features
    layout: {
      'icon-image': [
        'case',
        // Check if task is overlapping - use numbered marker based on task count
        ['get', 'isOverlapping'],
        [
          'case',
          ['<=', ['get', 'overlapTaskCount'], 20],
          ['concat', 'marker-overlap-', ['to-string', ['get', 'overlapTaskCount']]],
          'marker-overlap-many',
        ],
        // Regular non-overlapping markers
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
      'icon-size': [
        'case',
        ['get', 'isOverlapping'],
        1.0, // Overlap markers are already larger in the SVG
        0.8, // Regular markers
      ],
      'icon-anchor': 'bottom',
      'icon-allow-overlap': true,
    },
  })
}
