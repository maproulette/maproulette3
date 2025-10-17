import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { Loader } from '@/components/ui/Loader'

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
      center: [0, 0],
      zoom: 1,
    })

    map.current.on('load', () => {
      if (!map.current) return

      const createMarkerIcon = (color: string) => {
        const pinSvg = `
          <svg width="24" height="36" viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z" fill="${color}" stroke="white" stroke-width="2"/>
            <circle cx="12" cy="12" r="4" fill="white"/>
          </svg>
        `

        const pinImage = new Image(24, 36)
        pinImage.src = 'data:image/svg+xml;base64,' + btoa(pinSvg)
        return pinImage
      }

      const statusColors = {
        0: '#6b7280',
        1: '#3b82f6',
        2: '#ef4444',
        3: '#10b981',
        4: '#f59e0b',
        5: '#8b5cf6',
        6: '#ec4899',
      }

      Object.entries(statusColors).forEach(([status, color]) => {
        const icon = createMarkerIcon(color)
        icon.onload = () => {
          if (map.current) {
            map.current.addImage(`marker-pin-${status}`, icon)
          }
        }
      })
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!map.current || !taskMarkers || isLoadingTaskMarkers) return

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
          coordinates: [marker.location.lng, marker.location.lat],
        },
      })),
    }

    if (map.current.getSource('task-markers')) {
      if (map.current.getLayer('task-clusters')) map.current.removeLayer('task-clusters')
      if (map.current.getLayer('task-cluster-count')) map.current.removeLayer('task-cluster-count')
      if (map.current.getLayer('task-unclustered-point'))
        map.current.removeLayer('task-unclustered-point')
      map.current.removeSource('task-markers')
    }

    map.current.addSource('task-markers', {
      type: 'geojson',
      data: geoJsonData,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    })

    map.current.addLayer({
      id: 'task-clusters',
      type: 'circle',
      source: 'task-markers',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': ['step', ['get', 'point_count'], '#22c55e', 30, '#eab308', 70, '#f97316'],
        'circle-radius': ['step', ['get', 'point_count'], 20, 30, 25, 70, 30],
        'circle-stroke-width': 0,
        'circle-opacity': 0.9,
      },
    })

    map.current.addLayer({
      id: 'task-cluster-count',
      type: 'symbol',
      source: 'task-markers',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['to-string', ['get', 'point_count']],
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
      id: 'task-unclustered-point',
      type: 'symbol',
      source: 'task-markers',
      filter: ['!', ['has', 'point_count']],
      layout: {
        'icon-image': [
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
        'icon-size': 0.8,
        'icon-anchor': 'bottom',
        'icon-allow-overlap': true,
      },
    })

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

  return (
    <div className={`relative w-full h-full ${className}`} style={style}>
      <div ref={mapContainer} className="w-full h-full" />
      {isLoadingTaskMarkers && (
        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-10">
          <Loader message="Loading task markers..." />
        </div>
      )}
    </div>
  )
}
