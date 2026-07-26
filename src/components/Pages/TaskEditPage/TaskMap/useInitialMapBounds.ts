import bbox from '@turf/bbox'
import { useEffect, useRef, useState } from 'react'
import { api } from '@/api'
import { useTaskContext } from '@/components/Pages/TaskEditPage/contexts/TaskContext'
import { useTaskMapContext } from '@/components/Pages/TaskEditPage/contexts/TaskMapContext'
import { decorateTaskFeatures } from '@/lib/decorateTaskFeatures'
import type { Bbox2D } from '@/types/Map'

/**
 * Fits the map to the task's (or bundle's) geometry bounds once, the first
 * time the map is loaded and marker data has finished loading. Skipped when
 * the URL already has a hash (MapLibre's `hash` option has already restored a
 * viewport) so we don't fight that restored position.
 */
export const useInitialMapBounds = (mapLoaded: boolean, isLoadingMarkers: boolean) => {
  const { map: mapRef } = useTaskMapContext()
  const { task } = useTaskContext()
  const { data: fullTaskData } = api.task.getTask(task.id)

  const initialBoundsAppliedRef = useRef(false)
  const [initialBoundsApplied, setInitialBoundsApplied] = useState(false)

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || initialBoundsAppliedRef.current) return

    if (window.location.hash.length > 1) {
      initialBoundsAppliedRef.current = true
      setInitialBoundsApplied(true)
      return
    }

    if (isLoadingMarkers) return

    const map = mapRef.current.getMap()
    if (!map) return

    const taskWithGeometries = fullTaskData ?? task
    const geometries = decorateTaskFeatures(taskWithGeometries)
    map.fitBounds(bbox(geometries) as Bbox2D, {
      padding: 400,
      duration: 5000,
      maxZoom: 18,
    })
    initialBoundsAppliedRef.current = true
    setInitialBoundsApplied(true)
  }, [mapLoaded, isLoadingMarkers, task, fullTaskData])

  return initialBoundsApplied
}
