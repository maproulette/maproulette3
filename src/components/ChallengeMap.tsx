import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'

interface ChallengeMapProps {
  className?: string
  style?: React.CSSProperties
}

export const ChallengeMap = ({ className = '', style }: ChallengeMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const { data: taskMarkers, isLoading: isLoadingTaskMarkers } = useQuery(api.task.getTaskMarkers())
  
  useEffect(() => {
    if (map.current || !mapContainer.current) return

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm-tiles',
          },
        ],
      },
      center: [-111.8538964, 40.750354], // Center on Salt Lake City area
      zoom: 10,
    })

    // Initialize map without data layers - they will be added when data loads
    map.current.on('load', () => {
      // Map is ready, task markers will be added in separate effect
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Add task markers layer when data is available
  useEffect(() => {
    if (!map.current || !taskMarkers || isLoadingTaskMarkers) return

    // Convert task markers to GeoJSON format
    const geoJsonData = {
      type: 'FeatureCollection' as const,
      features: taskMarkers.map((marker) => ({
        type: 'Feature' as const,
        properties: {
          id: marker.id,
          status: marker.status,
          challengeName: marker.challengeName,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [marker.location.lng, marker.location.lat], // [lng, lat]
        },
      })),
    }

    // Remove existing task markers source and layers if they exist
    if (map.current.getSource('task-markers')) {
      if (map.current.getLayer('task-clusters')) map.current.removeLayer('task-clusters')
      if (map.current.getLayer('task-cluster-count')) map.current.removeLayer('task-cluster-count')
      if (map.current.getLayer('task-unclustered-point')) map.current.removeLayer('task-unclustered-point')
      map.current.removeSource('task-markers')
    }

    // Add task markers source
    map.current.addSource('task-markers', {
      type: 'geojson',
      data: geoJsonData,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    })

    // Add clustered points layer
    map.current.addLayer({
      id: 'task-clusters',
      type: 'circle',
      source: 'task-markers',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#3b82f6', // blue for small clusters
          20,
          '#f59e0b', // amber for medium clusters
          100,
          '#ef4444', // red for large clusters
        ],
        'circle-radius': ['step', ['get', 'point_count'], 15, 10, 20, 25, 25],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    })

    // Add cluster count labels
    map.current.addLayer({
      id: 'task-cluster-count',
      type: 'symbol',
      source: 'task-markers',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['Noto Sans Regular'],
        'text-size': 12,
        'text-allow-overlap': true,
      },
      paint: {
        'text-color': '#ffffff',
      },
    })

    // Add unclustered points layer with status-based styling
    map.current.addLayer({
      id: 'task-unclustered-point',
      type: 'circle',
      source: 'task-markers',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': [
          'case',
          ['==', ['get', 'status'], 0], '#6b7280', // gray for created
          ['==', ['get', 'status'], 1], '#3b82f6', // blue for fixed
          ['==', ['get', 'status'], 2], '#ef4444', // red for false positive
          ['==', ['get', 'status'], 3], '#10b981', // green for skipped
          ['==', ['get', 'status'], 4], '#f59e0b', // amber for deleted
          ['==', ['get', 'status'], 5], '#8b5cf6', // purple for already fixed
          ['==', ['get', 'status'], 6], '#ec4899', // pink for too hard
          '#6b7280', // default gray
        ],
        'circle-radius': 6,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    })

    // Add click handler for clusters
    map.current.on('click', 'task-clusters', async (e) => {
      if (!map.current) return

      const features = map.current.queryRenderedFeatures(e.point, {
        layers: ['task-clusters'],
      })
      const clusterId = features[0].properties.cluster_id
      const source = map.current.getSource('task-markers') as maplibregl.GeoJSONSource
      const zoom = await source.getClusterExpansionZoom(clusterId)
      map.current.easeTo({
        center: (features[0].geometry as any).coordinates as [number, number],
        zoom,
      })
    })

    // Add click handler for individual task markers
    map.current.on('click', 'task-unclustered-point', (e) => {
      if (!map.current || !e.features?.[0]) return

      const coordinates = (e.features[0].geometry as any).coordinates.slice() as [number, number]
      const { id, status, challengeName } = e.features[0].properties

      const statusMap: Record<number, string> = {
        0: 'Created',
        1: 'Fixed',
        2: 'False Positive',
        3: 'Skipped',
        4: 'Deleted',
        5: 'Already Fixed',
        6: 'Too Hard',
      }
      const statusText = statusMap[status as number] || 'Unknown'

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
      }

      new maplibregl.Popup()
        .setLngLat(coordinates)
        .setHTML(`
          <div class="p-2">
            <h3 class="font-semibold text-sm mb-1">${challengeName}</h3>
            <p class="text-xs text-gray-600">Task ID: ${id}</p>
            <p class="text-xs">Status: <span class="font-medium">${statusText}</span></p>
          </div>
        `)
        .addTo(map.current)
    })

    // Add hover effects
    map.current.on('mouseenter', 'task-clusters', () => {
      if (!map.current) return
      map.current.getCanvas().style.cursor = 'pointer'
    })

    map.current.on('mouseleave', 'task-clusters', () => {
      if (!map.current) return
      map.current.getCanvas().style.cursor = ''
    })

    map.current.on('mouseenter', 'task-unclustered-point', () => {
      if (!map.current) return
      map.current.getCanvas().style.cursor = 'pointer'
    })

    map.current.on('mouseleave', 'task-unclustered-point', () => {
      if (!map.current) return
      map.current.getCanvas().style.cursor = ''
    })
  }, [taskMarkers, isLoadingTaskMarkers])

  return <div ref={mapContainer} className={`w-full h-full ${className}`} style={style} />
}
