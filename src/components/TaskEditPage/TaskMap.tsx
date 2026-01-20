import type maplibregl from 'maplibre-gl'
import { useMemo, useState } from 'react'
import { Map as MapGL } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapControls } from '@/components/shared/MapControls'
import { MapStyleSwitcher } from '@/components/shared/MapStyleSwitcher'
import { getStyleSpecification } from '@/utils/mapStyles'
import { useTaskContext } from './contexts/TaskContext'
import { useTaskMapContext } from './contexts/TaskMapContext'

export const TaskMap = () => {
  const { map, mapLoaded, setMapLoaded } = useTaskMapContext()
  const { task } = useTaskContext()
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
    let zoom = 2

    if (task.location) {
      if (typeof task.location === 'string') {
        try {
          const parsed = JSON.parse(task.location) as { lng?: number; lat?: number }
          if (parsed.lng != null && parsed.lat != null) {
            longitude = parsed.lng
            latitude = parsed.lat
            zoom = 15
          }
        } catch {
          // Invalid JSON, use default
        }
      } else if (
        typeof task.location === 'object' &&
        task.location != null &&
        'lng' in task.location &&
        'lat' in task.location
      ) {
        const loc = task.location as { lng: number; lat: number }
        longitude = loc.lng
        latitude = loc.lat
        zoom = 15
      }
    }

    return {
      longitude,
      latitude,
      zoom,
    }
  }, [task.location])

  return (
    <div className="relative h-full w-full">
      <MapGL
        ref={map}
        initialViewState={initialViewState}
        mapStyle={defaultStyle}
        onLoad={() => setMapLoaded(true)}
      />
      <MapControls
        map={map}
        mapLoaded={mapLoaded}
        showZoom={true}
        showReset={true}
        showLayers={true}
        onLayersClick={() => setIsStylePanelOpen(!isStylePanelOpen)}
      />
      <MapStyleSwitcher
        map={map}
        mapLoaded={mapLoaded}
        isOpen={isStylePanelOpen}
        onClose={() => setIsStylePanelOpen(false)}
      />
    </div>
  )
}
