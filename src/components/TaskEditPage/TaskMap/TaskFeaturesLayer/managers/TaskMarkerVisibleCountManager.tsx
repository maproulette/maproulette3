import type maplibregl from 'maplibre-gl'
import { useEffect } from 'react'
import type { TaskMarker } from '@/types/Task'

interface TaskMarkerVisibleCountManagerProps {
  map: React.RefObject<maplibregl.Map | null>
  taskMarkers: TaskMarker[] | undefined
  mapLoaded: boolean
}

/**
 * Manages tracking the number of visible task markers within the current map bounds
 */
export const TaskMarkerVisibleCountManager = ({
  map,
  taskMarkers,
  mapLoaded,
}: TaskMarkerVisibleCountManagerProps) => {
  useEffect(() => {
    if (!map.current || !taskMarkers || !mapLoaded) return

    const updateVisibleCount = () => {
      const bounds = map.current?.getBounds()
      if (!bounds) return

      const count = taskMarkers.filter((marker) => {
        return bounds.contains([marker.location.lng, marker.location.lat])
      }).length

      // Count is tracked but not used in this component
      // This manager exists to maintain the same behavior as the hook
      void count
    }

    updateVisibleCount()
    map.current.on('move', updateVisibleCount)

    return () => {
      map.current?.off('move', updateVisibleCount)
    }
  }, [map, taskMarkers, mapLoaded])

  return null
}
