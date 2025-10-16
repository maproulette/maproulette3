import maplibregl from 'maplibre-gl'
import { useEffect, useRef, useState } from 'react'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Task } from '@/types/Task'
import { isLineString, isPoint, isPolygon } from '@/utils/featureTypes'

interface MapProps {
  task: Task
  className?: string
}

export const TaskMap = ({ task, className = '' }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

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
      setMapLoaded(true)
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!map.current || !mapLoaded) return

    if (map.current.getSource('task-geometries')) {
      map.current.removeLayer('task-geometries')
      map.current.removeSource('task-geometries')
    }

    if (task.geometries && task.geometries.features.length > 0) {
      map.current.addSource('task-geometries', {
        type: 'geojson',
        data: task.geometries,
      })

      map.current.addLayer({
        id: 'task-geometries',
        type: 'circle',
        source: 'task-geometries',
        paint: {
          'circle-color': '#ff6b6b',
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      })

      const bounds = new maplibregl.LngLatBounds()

      task.geometries.features.forEach((feature) => {
        if (isPoint(feature.geometry)) {
          bounds.extend(feature.geometry.coordinates)
        } else if (isLineString(feature.geometry)) {
          feature.geometry.coordinates.forEach((coord) => {
            bounds.extend(coord)
          })
        } else if (isPolygon(feature.geometry)) {
          feature.geometry.coordinates.forEach((ring) => {
            ring.forEach((coord) => {
              bounds.extend(coord)
            })
          })
        }
      })

      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 18,
        })
      } else if (task.location?.coordinates) {
        const [lng, lat] = task.location.coordinates
        map.current.setCenter([lng, lat])
        map.current.setZoom(15)
      }
    } else if (task.location?.coordinates) {
      const [lng, lat] = task.location.coordinates
      map.current.setCenter([lng, lat])
      map.current.setZoom(15)
    }
  }, [task, mapLoaded])

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="h-full w-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-gray-600">Loading map...</div>
        </div>
      )}
    </div>
  )
}
