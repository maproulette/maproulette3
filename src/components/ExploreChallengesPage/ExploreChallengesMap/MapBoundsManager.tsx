import { useEffect, useRef } from 'react'
import {
  fitMapToBounds,
  getMapBoundsString,
  isWorldBounds,
  parseBoundsString,
} from '@/utils/mapUtils'
import { useExploreChallengesSearchContext } from '../ExploreChallengesSearchContext'
import { useExploreChallengesMapContext } from './ExploreChallengesMapContext'

export const MapBoundsManager = () => {
  const { map, mapLoaded } = useExploreChallengesMapContext()
  const { bounds, setBounds } = useExploreChallengesSearchContext()
  const hasAppliedInitialBounds = useRef(false)

  useEffect(() => {
    if (
      mapLoaded &&
      map.current &&
      !hasAppliedInitialBounds.current &&
      bounds &&
      !isWorldBounds(bounds)
    ) {
      const parsedBounds = parseBoundsString(bounds)
      if (parsedBounds) {
        const bounds: [[number, number], [number, number]] = [
          [parsedBounds[0], parsedBounds[1]],
          [parsedBounds[2], parsedBounds[3]],
        ]
        fitMapToBounds(map.current, bounds, { padding: 50, duration: 0 })
        hasAppliedInitialBounds.current = true
      }
    }
  }, [mapLoaded, map, bounds])

  useEffect(() => {
    if (!map.current || !mapLoaded) return

    const mapInstance = map.current

    const updateBounds = () => {
      const boundsString = getMapBoundsString(mapInstance)
      setBounds(boundsString)
    }

    const hasInitialBounds = bounds && !isWorldBounds(bounds)
    if (!hasInitialBounds || hasAppliedInitialBounds.current) {
      updateBounds()
    }

    mapInstance.on('moveend', updateBounds)

    return () => {
      mapInstance.off('moveend', updateBounds)
    }
  }, [map, mapLoaded, bounds, setBounds])

  return null
}
