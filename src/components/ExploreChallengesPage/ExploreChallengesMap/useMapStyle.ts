import type maplibregl from 'maplibre-gl'
import { useEffect, useMemo } from 'react'
import type { MapRef } from 'react-map-gl/maplibre'
import { createMarkerIcons } from '@/components/shared/TaskMarkers/createMarkerIcons'
import { getStyleSpecification } from '@/utils/mapStyles'

export const useMapStyle = (
  mapRef: React.RefObject<MapRef | null>,
  mapLoaded: boolean,
  shouldCluster: boolean
) => {
  const defaultStyle = useMemo(() => {
    const styleSpec = getStyleSpecification('osm-us-vector')
    if (styleSpec) {
      return styleSpec as string | maplibregl.StyleSpecification
    }

    return 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
  }, [])

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !shouldCluster) return

    const map = mapRef.current.getMap()
    if (!map) return

    createMarkerIcons({ current: map })
  }, [mapLoaded, shouldCluster, mapRef])

  return {
    defaultStyle,
  }
}
