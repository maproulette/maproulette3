import { useEffect, useRef } from 'react'
import type { TaskMarker } from '@/types/Task'

export const useMarkerVisibility = (
  selectedMarker: TaskMarker | null,
  markersHidden: boolean,
  setMarkersHidden: (hidden: boolean) => void
) => {
  const prevSelectedMarkerRef = useRef<typeof selectedMarker>(null)

  // Reset markersHidden only when selectedMarker transitions from non-null to null
  // (i.e., when a popup is closed, not when it was already null)
  useEffect(() => {
    const hadMarker = prevSelectedMarkerRef.current !== null
    const hasMarker = selectedMarker !== null

    // Only reset if we had a marker before and now we don't
    if (hadMarker && !hasMarker && markersHidden) {
      setMarkersHidden(false)
    }

    prevSelectedMarkerRef.current = selectedMarker
  }, [selectedMarker, markersHidden, setMarkersHidden])
}
