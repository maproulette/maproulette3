import type maplibregl from 'maplibre-gl'
import { useEffect, useRef } from 'react'
import type { Task } from '@/types/Task'
import { zoomToTask } from '../../zoomToTask'

interface UseTaskMarkerInitialZoomProps {
  map: React.RefObject<maplibregl.Map | null>
  mapLoaded: boolean
  task: Task | undefined
}

export const useTaskMarkerInitialZoom = ({
  map,
  mapLoaded,
  task,
}: UseTaskMarkerInitialZoomProps) => {
  const hasInitialZoomedRef = useRef(false)

  useEffect(() => {
    if (!map.current || !mapLoaded || hasInitialZoomedRef.current || !task) {
      return
    }

    // Wait a bit for map to be fully ready, then zoom
    const timeoutId = setTimeout(() => {
      if (map.current && !hasInitialZoomedRef.current && task) {
        hasInitialZoomedRef.current = true
        zoomToTask(map.current, task)
      }
    }, 500)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [map, mapLoaded, task])
}
