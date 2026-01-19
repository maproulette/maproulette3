import type maplibregl from 'maplibre-gl'
import { useEffect, useRef } from 'react'
import type { Task } from '@/types/Task'
import { zoomToTask } from '../../zoomToTask'

interface TaskMarkerInitialZoomManagerProps {
  map: React.RefObject<maplibregl.Map | null>
  mapLoaded: boolean
  task: Task | null
}

/**
 * Manages initial zoom to the primary task
 */
export const TaskMarkerInitialZoomManager = ({
  map,
  mapLoaded,
  task,
}: TaskMarkerInitialZoomManagerProps) => {
  const hasInitialZoomedRef = useRef(false)

  useEffect(() => {
    if (!map.current || !mapLoaded || hasInitialZoomedRef.current || !task) {
      return
    }

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

  return null
}
