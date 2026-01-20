import type maplibregl from 'maplibre-gl'
import { useMemo, useRef, useState } from 'react'
import type { MapRef } from 'react-map-gl/maplibre'
import { Map as MapGL } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapControls } from '@/components/shared/MapControls'
import { MapStyleSwitcher } from '@/components/shared/MapStyleSwitcher'
import { getStyleSpecification } from '@/utils/mapStyles'
import { useBrowsedChallengeContext } from './contexts/BrowsedChallengeContext'

export const BrowseChallengeMap = () => {
  const { challenge } = useBrowsedChallengeContext()
  const mapRef = useRef<MapRef | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [isStylePanelOpen, setIsStylePanelOpen] = useState(false)

  // Get default style (OSM US Vector)
  const defaultStyle = useMemo(() => {
    const styleSpec = getStyleSpecification('osm-us-vector')
    if (styleSpec) {
      return styleSpec as string | maplibregl.StyleSpecification
    }
    // Fallback to Carto Voyager if style not found
    return 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
  }, [])

  const initialViewState = useMemo(() => {
    let latitude = 0
    let longitude = 0

    if (challenge?.location) {
      if (typeof challenge.location === 'string') {
        try {
          const parsed = JSON.parse(challenge.location) as { lng?: number; lat?: number }
          if (parsed.lng != null && parsed.lat != null) {
            longitude = parsed.lng
            latitude = parsed.lat
          }
        } catch {
          // Invalid JSON, use default
        }
      } else if (
        typeof challenge.location === 'object' &&
        challenge.location != null &&
        'lng' in challenge.location &&
        'lat' in challenge.location
      ) {
        const loc = challenge.location as { lng: number; lat: number }
        longitude = loc.lng
        latitude = loc.lat
      }
    }

    return {
      longitude,
      latitude,
      zoom: challenge?.defaultZoom ?? 2,
    }
  }, [challenge?.location, challenge?.defaultZoom])

  return (
    <div className="relative h-full w-full">
      <MapGL
        ref={mapRef}
        initialViewState={initialViewState}
        mapStyle={defaultStyle}
        onLoad={() => setMapLoaded(true)}
      />
      <MapControls
        map={mapRef}
        mapLoaded={mapLoaded}
        showZoom={true}
        showReset={true}
        showLayers={true}
        onLayersClick={() => setIsStylePanelOpen(!isStylePanelOpen)}
      />
      <MapStyleSwitcher
        map={mapRef}
        mapLoaded={mapLoaded}
        isOpen={isStylePanelOpen}
        onClose={() => setIsStylePanelOpen(false)}
      />
    </div>
  )
}
