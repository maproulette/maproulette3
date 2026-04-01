import type maplibregl from 'maplibre-gl'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { LayerProps, MapRef } from 'react-map-gl/maplibre'
import { Layer, Map as MapGL, Source } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { api } from '@/api'
import { getStyleSpecification } from '@/components/shared/Map/mapStyles'
import { processMarkersData } from '@/components/shared/TaskMarkers/utils'
import { Skeleton } from '@/components/ui/Skeleton'

interface MiniChallengeMapProps {
  challengeId: number
  /** Tailwind height/min-height classes for the map container (default compact sidebar size). */
  containerClassName?: string
  /** Called when the visible bounds change (debounced), as `left,bottom,right,top`. */
  onBoundsStringChange?: (bounds: string) => void
}

const clusterLayer: LayerProps = {
  id: 'mini-clusters',
  type: 'circle',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': '#64748b',
    'circle-radius': ['step', ['get', 'point_count'], 18, 50, 24, 200, 30],
    'circle-opacity': 0.85,
  },
}

const clusterCountLayer: LayerProps = {
  id: 'mini-cluster-count',
  type: 'symbol',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': ['get', 'point_count_abbreviated'],
    'text-size': 12,
  },
  paint: {
    'text-color': '#ffffff',
  },
}

const unclusteredPointLayer: LayerProps = {
  id: 'mini-unclustered-point',
  type: 'circle',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': '#0f172a',
    'circle-radius': 4,
    'circle-stroke-width': 1.5,
    'circle-stroke-color': '#ffffff',
  },
}

const BOUNDS_DEBOUNCE_MS = 400

export const MiniChallengeMap = ({
  challengeId,
  containerClassName = 'h-52 w-full',
  onBoundsStringChange,
}: MiniChallengeMapProps) => {
  const sourceId = useId()
  const mapRef = useRef<MapRef | null>(null)
  const boundsDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const { data: taskMarkersData, isLoading } = api.challenge.getChallengeTaskMarkers(challengeId)

  const scheduleBoundsReport = useCallback(() => {
    if (!onBoundsStringChange) return
    if (boundsDebounceRef.current) {
      clearTimeout(boundsDebounceRef.current)
    }
    boundsDebounceRef.current = setTimeout(() => {
      boundsDebounceRef.current = null
      const map = mapRef.current?.getMap()
      if (!map) return
      const b = map.getBounds()
      onBoundsStringChange(`${b.getWest()},${b.getSouth()},${b.getEast()},${b.getNorth()}`)
    }, BOUNDS_DEBOUNCE_MS)
  }, [onBoundsStringChange])

  useEffect(() => {
    return () => {
      if (boundsDebounceRef.current) {
        clearTimeout(boundsDebounceRef.current)
      }
    }
  }, [])

  const geoJsonData = useMemo<GeoJSON.FeatureCollection>(() => {
    const markers = processMarkersData(taskMarkersData).markers
    return {
      type: 'FeatureCollection',
      features: markers
        .filter((m) => m.location != null)
        .map((m) => ({
          type: 'Feature' as const,
          properties: {
            id: m.id,
          },
          geometry: {
            type: 'Point' as const,
            coordinates: [m.location.lng, m.location.lat],
          },
        })),
    }
  }, [taskMarkersData])

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return
    if (geoJsonData.features.length === 0) {
      scheduleBoundsReport()
      return
    }

    const map = mapRef.current.getMap()
    const coordinates = geoJsonData.features
      .filter((f): f is GeoJSON.Feature<GeoJSON.Point> => f.geometry.type === 'Point')
      .map((f) => f.geometry.coordinates)

    if (coordinates.length === 0) return

    const lngs = coordinates.map((c) => c[0])
    const lats = coordinates.map((c) => c[1])
    const west = Math.min(...lngs)
    const east = Math.max(...lngs)
    const south = Math.min(...lats)
    const north = Math.max(...lats)

    if (west === east && south === north) {
      map.flyTo({ center: [west, south], zoom: 12, duration: 0 })
    } else {
      map.fitBounds(
        [
          [west, south],
          [east, north],
        ],
        { padding: 28, duration: 0 }
      )
    }
    scheduleBoundsReport()
  }, [mapLoaded, geoJsonData, scheduleBoundsReport])

  const defaultStyle = useMemo(() => {
    const styleSpec = getStyleSpecification('osm-us-vector')
    if (styleSpec) {
      return styleSpec as string | maplibregl.StyleSpecification
    }
    return 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
  }, [])

  if (isLoading && geoJsonData.features.length === 0) {
    return <Skeleton className={`${containerClassName} rounded-lg`} />
  }

  return (
    <div
      className={`relative ${containerClassName} overflow-hidden rounded-lg border border-zinc-200 dark:border-slate-700`}
    >
      <div className="absolute inset-0">
        <MapGL
          ref={mapRef}
          initialViewState={{ longitude: 0, latitude: 0, zoom: 1.5 }}
          mapStyle={defaultStyle}
          style={{ width: '100%', height: '100%' }}
          onLoad={() => setMapLoaded(true)}
          onMoveEnd={onBoundsStringChange ? scheduleBoundsReport : undefined}
          attributionControl={false}
          dragRotate={false}
          touchPitch={false}
        >
          <Source
            id={sourceId}
            type="geojson"
            data={geoJsonData}
            cluster={true}
            clusterMaxZoom={16}
            clusterRadius={40}
          >
            <Layer {...clusterLayer} />
            <Layer {...clusterCountLayer} />
            <Layer {...unclusteredPointLayer} />
          </Source>
        </MapGL>
      </div>
    </div>
  )
}
