import { useEffect } from 'react'
import { fitMapToBounds, parseBoundsString } from '@/utils/mapUtils'
import { useExploreChallengesSearchContext } from '../../ExploreChallengesSearchContext'
import { useExploreChallengesMapContext } from '../ExploreChallengesMapContext'

/**
 * Hook to handle fitting the map to pending bounds
 */
export const useMapFitBounds = (): void => {
  const { map, mapLoaded } = useExploreChallengesMapContext()
  const { pendingFitBounds, clearPendingFitBounds } = useExploreChallengesSearchContext()
  useEffect(() => {
    if (!pendingFitBounds || !map.current || !mapLoaded) return

    const parsed = parseBoundsString(pendingFitBounds)
    if (parsed) {
      const bounds: [[number, number], [number, number]] = [
        [parsed[0], parsed[1]],
        [parsed[2], parsed[3]],
      ]
      fitMapToBounds(map.current, bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        duration: 1000,
      })
    }
    clearPendingFitBounds()
  }, [pendingFitBounds, map, mapLoaded, clearPendingFitBounds])
}
