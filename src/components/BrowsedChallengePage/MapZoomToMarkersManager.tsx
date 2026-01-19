import { useQuery } from '@tanstack/react-query'
import maplibregl from 'maplibre-gl'
import { useEffect, useRef } from 'react'
import { api } from '@/api'
import { fitMapToBounds } from '@/utils/mapUtils'
import { useBrowseChallengeMapContext } from './contexts/BrowseChallengeMapContext'
import { useBrowsedChallengeContext } from './contexts/BrowsedChallengeContext'

/**
 * Manager component to handle zooming the map to fit task markers
 * - Resets zoom state when challenge changes
 * - Fits map to bounds when task markers are loaded
 */
export const MapZoomToMarkersManager = () => {
  const { challenge } = useBrowsedChallengeContext()
  const { map, mapLoaded } = useBrowseChallengeMapContext()
  const { data: taskMarkers, isLoading } = useQuery(
    api.challenge.getChallengeTaskMarkers(challenge.id)
  )
  const hasZoomedToMarkers = useRef(false)

  useEffect(() => {
    hasZoomedToMarkers.current = false
  }, [challenge.id])

  useEffect(() => {
    if (
      hasZoomedToMarkers.current ||
      isLoading ||
      !taskMarkers ||
      taskMarkers.length === 0 ||
      !mapLoaded ||
      !map.current
    ) {
      return
    }

    const bounds = new maplibregl.LngLatBounds()
    let hasValidBounds = false

    taskMarkers.forEach((marker) => {
      if (marker.location?.lng != null && marker.location?.lat != null) {
        bounds.extend([marker.location.lng, marker.location.lat])
        hasValidBounds = true
      }
    })

    if (hasValidBounds && !bounds.isEmpty()) {
      const boundsArray: [[number, number], [number, number]] = [
        [bounds.getWest(), bounds.getSouth()],
        [bounds.getEast(), bounds.getNorth()],
      ]

      fitMapToBounds(map.current, boundsArray, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        duration: 1000,
      })

      hasZoomedToMarkers.current = true
    }
  }, [taskMarkers, isLoading, mapLoaded, map])

  return null
}
