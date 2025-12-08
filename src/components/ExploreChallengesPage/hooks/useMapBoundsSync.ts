import type maplibregl from 'maplibre-gl'
import { useEffect, useRef } from 'react'
import { fitMapToBounds, getMapBoundsString, parseBoundsString } from '@/utils/mapUtils'

interface UseMapBoundsSyncOptions {
  map: React.RefObject<maplibregl.Map | null>
  mapLoaded: boolean
  initialBounds: string | undefined
  onBoundsChange: (bounds: string) => void
}

export const useMapBoundsSync = ({
  map,
  mapLoaded,
  initialBounds,
  onBoundsChange,
}: UseMapBoundsSyncOptions) => {
  const hasAppliedInitialBounds = useRef(false)

  useEffect(() => {
    if (
      mapLoaded &&
      map.current &&
      !hasAppliedInitialBounds.current &&
      initialBounds &&
      initialBounds !== '-180,-90,180,90'
    ) {
      const parsedBounds = parseBoundsString(initialBounds)
      if (parsedBounds) {
        const bounds: [[number, number], [number, number]] = [
          [parsedBounds[0], parsedBounds[1]],
          [parsedBounds[2], parsedBounds[3]],
        ]
        fitMapToBounds(map.current, bounds, { padding: 50, duration: 0 })
        hasAppliedInitialBounds.current = true
      }
    }
  }, [mapLoaded, map, initialBounds])

  useEffect(() => {
    if (!map.current || !mapLoaded) return

    const mapInstance = map.current

    const updateBounds = () => {
      const boundsString = getMapBoundsString(mapInstance)
      onBoundsChange(boundsString)
    }

    const hasInitialBounds = initialBounds && initialBounds !== '-180,-90,180,90'
    if (!hasInitialBounds || hasAppliedInitialBounds.current) {
      updateBounds()
    }

    mapInstance.on('moveend', updateBounds)

    return () => {
      mapInstance.off('moveend', updateBounds)
    }
  }, [map, mapLoaded, initialBounds, onBoundsChange])
}
