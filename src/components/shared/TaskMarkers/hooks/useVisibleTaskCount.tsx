import { useEffect, useState } from 'react'
import type { TaskMarker } from '@/types/Task'

/**
 * Hook to track the number of visible task markers within the current map bounds
 */
export const useVisibleTaskCount = (
  map: React.RefObject<maplibregl.Map | null>,
  taskMarkers: TaskMarker[] | undefined,
  mapLoaded: boolean
) => {
  const [visibleTaskCount, setVisibleTaskCount] = useState(0)

  useEffect(() => {
    if (!map.current || !taskMarkers || !mapLoaded) return

    const updateVisibleCount = () => {
      const bounds = map.current?.getBounds()
      if (!bounds) return

      const count = taskMarkers.filter((marker) => {
        return bounds.contains([marker.location.lng, marker.location.lat])
      }).length

      setVisibleTaskCount(count)
    }

    updateVisibleCount()
    map.current.on('move', updateVisibleCount)

    return () => {
      map.current?.off('move', updateVisibleCount)
    }
  }, [map, taskMarkers, mapLoaded])

  return visibleTaskCount
}

