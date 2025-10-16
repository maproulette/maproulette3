import maplibregl from 'maplibre-gl'
import { useEffect, useRef, useState } from 'react'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Challenge } from '@/types/Challenge'

interface ChallengeMapProps {
  challenges?: Challenge[]
  className?: string
  center?: [number, number]
  zoom?: number
}

export const ChallengeMap = ({
  challenges = [],
  className = '',
  center = [0, 0],
  zoom = 2,
}: ChallengeMapProps) => {
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
      center,
      zoom,
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
  }, [center, zoom])

  useEffect(() => {
    if (!map.current || !mapLoaded || !challenges.length) return

    // Remove existing challenge markers
    if (map.current.getSource('challenge-markers')) {
      map.current.removeLayer('challenge-markers')
      map.current.removeSource('challenge-markers')
    }

    // Create GeoJSON for challenge locations
    const geojson = {
      type: 'FeatureCollection' as const,
      features: challenges
        .filter((challenge) => challenge.location?.coordinates)
        .map((challenge) => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: challenge.location.coordinates,
          },
          properties: {
            id: challenge.id,
            name: challenge.name,
            completionPercentage: challenge.completionPercentage,
          },
        })),
    }

    map.current.addSource('challenge-markers', {
      type: 'geojson',
      data: geojson,
    })

    map.current.addLayer({
      id: 'challenge-markers',
      type: 'circle',
      source: 'challenge-markers',
      paint: {
        'circle-color': '#3b82f6',
        'circle-radius': 6,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    })

    // Add click handler for markers
    map.current.on('click', 'challenge-markers', (e) => {
      if (e.features && e.features[0]) {
        const feature = e.features[0]
        const coordinates = (feature.geometry as any).coordinates.slice()
        const { name, completionPercentage } = feature.properties as any

        new maplibregl.Popup()
          .setLngLat(coordinates)
          .setHTML(`
            <div class="p-2">
              <h3 class="font-semibold text-sm">${name}</h3>
              <p class="text-xs text-gray-600">${completionPercentage}% complete</p>
            </div>
          `)
          .addTo(map.current!)
      }
    })

    // Change cursor on hover
    map.current.on('mouseenter', 'challenge-markers', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer'
    })

    map.current.on('mouseleave', 'challenge-markers', () => {
      if (map.current) map.current.getCanvas().style.cursor = ''
    })
  }, [challenges, mapLoaded])

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
