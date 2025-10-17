import { Loader } from '@/components/ui/Loader'
import { useRef, useEffect } from 'react'
import maplibregl from 'maplibre-gl'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { useSearchContext } from '../../SearchContextProvider'
import MapControls from './MapControls'

export const ChallengeMap = () => {
  const { taskMarkerParams, searchParams, setSearchParams } = useSearchContext()
  const { data: taskMarkers, isLoading: isLoadingTaskMarkers } = useQuery(
    api.task.getTaskMarkers(taskMarkerParams)
  )

  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const mapLoaded = useRef<boolean>(false)

  // Status filter state - all statuses enabled by default

  const statusOptions = [
    { value: 0, label: 'Created', color: '#959DFF' }, // purple
    { value: 1, label: 'Fixed', color: '#65D2DA' }, // blue-viking
    { value: 2, label: 'False Positive', color: '#F7BB59' }, // mango
    { value: 3, label: 'Skipped', color: '#E87CE0' }, // pink
    { value: 4, label: 'Deleted', color: '#737373' }, // grey
    { value: 5, label: 'Already Fixed', color: '#CCB186' }, // yellow-sand
    { value: 6, label: 'Too Hard', color: '#FF5E63' }, // red-light
  ]

  const toggleStatusFilter = (status: number) => {
    const isCurrentlySelected = searchParams.statuses.includes(status)
    
    setSearchParams({
      ...searchParams,
      statuses: isCurrentlySelected
        ? searchParams.statuses.filter(s => s !== status)
        : [...searchParams.statuses, status],
    })
  }

  const addTaskMarkersToMap = () => {
    if (!map.current || !taskMarkers || isLoadingTaskMarkers || !mapLoaded.current) return

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
        'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
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

    // Add event listeners only once
    if (!map.current.listens('click')) {
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
    }
  }

  useEffect(() => {
    if (map.current || !mapContainer.current) return

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
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

      mapLoaded.current = true

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
        0: '#959DFF', // purple - Created
        1: '#65D2DA', // blue-viking - Fixed
        2: '#F7BB59', // mango - False Positive
        3: '#E87CE0', // pink - Skipped
        4: '#737373', // grey - Deleted
        5: '#CCB186', // yellow-sand - Already Fixed
        6: '#FF5E63', // red-light - Too Hard
      }

      Object.entries(statusColors).forEach(([status, color]) => {
        const icon = createMarkerIcon(color)
        icon.onload = () => {
          if (map.current) {
            map.current.addImage(`marker-pin-${status}`, icon)
          }
        }
      })

      // Try to add task markers if they're already loaded
      addTaskMarkersToMap()
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
        mapLoaded.current = false
      }
    }
  }, [])

  useEffect(() => {
    addTaskMarkersToMap()
  }, [taskMarkers, isLoadingTaskMarkers])

  return (
    <div ref={mapContainer} className="flex-1 relative relative w-full h-full">
      <div 
        className={`absolute inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-10 transition-opacity duration-200 ${
          isLoadingTaskMarkers ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <Loader message="Loading task markers..." />
      </div>
      
      {/* Status Filter */}
      <div className="absolute top-4 left-4 bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-3 z-20 max-w-xs">
        <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">Task Status Filter</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {statusOptions.map((status) => (
            <label key={status.value} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={searchParams.statuses.includes(status.value)}
                onChange={() => toggleStatusFilter(status.value)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div 
                className="w-3 h-3 rounded-full border border-white"
                style={{ backgroundColor: status.color }}
              />
              <span className="text-xs text-gray-700 dark:text-gray-300">{status.label}</span>
            </label>
          ))}
        </div>
      </div>
      
      <MapControls />
    </div>
  )
}
