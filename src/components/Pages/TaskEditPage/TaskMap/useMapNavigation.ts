import { useCallback, useEffect, useRef } from 'react'
import { useTaskBundleContext } from '@/components/Pages/TaskEditPage/contexts/TaskBundleContext'
import { useTaskContext } from '@/components/Pages/TaskEditPage/contexts/TaskContext'
import { useTaskMapContext } from '@/components/Pages/TaskEditPage/contexts/TaskMapContext'
import type { TaskMarker } from '@/types/Task'

export const initialViewState = {
  longitude: 0,
  latitude: 0,
  zoom: 2,
}

export const useMapNavigation = (
  mapLoaded: boolean,
  markers: TaskMarker[],
  allMarkersMap: Map<number, TaskMarker>
) => {
  const { map: mapRef } = useTaskMapContext()
  const { task } = useTaskContext()
  const { activeBundle } = useTaskBundleContext()
  const primaryTaskId = task.id

  // Track if we've already zoomed to the primary task for this task ID
  const lastZoomedTaskIdRef = useRef<number | null>(null)

  // Zoom to primary task when task changes or markers initially load
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return
    if (markers.length === 0) return

    // Only zoom if we haven't already zoomed to this task
    if (lastZoomedTaskIdRef.current === primaryTaskId) return

    const primaryMarker = markers.find((m) => m.id === primaryTaskId)
    if (primaryMarker?.location) {
      mapRef.current.flyTo({
        center: [primaryMarker.location.lng, primaryMarker.location.lat],
        zoom: 16,
        duration: 1000,
      })
      lastZoomedTaskIdRef.current = primaryTaskId
    }
  }, [mapLoaded, primaryTaskId, markers])

  // Reason: stable callback prevents map event listener re-registration
  const handleCenterToTask = useCallback(() => {
    if (!mapRef.current) return

    if (activeBundle && activeBundle.taskIds.length > 1) {
      // Center to bundle bounds
      const bundleMarkers = activeBundle.taskIds
        .map((id) => allMarkersMap.get(id))
        .filter((m): m is TaskMarker => m !== undefined && m.location !== undefined)

      if (bundleMarkers.length > 0) {
        // Calculate bounding box
        let minLng = Infinity
        let maxLng = -Infinity
        let minLat = Infinity
        let maxLat = -Infinity

        for (const marker of bundleMarkers) {
          if (marker.location) {
            minLng = Math.min(minLng, marker.location.lng)
            maxLng = Math.max(maxLng, marker.location.lng)
            minLat = Math.min(minLat, marker.location.lat)
            maxLat = Math.max(maxLat, marker.location.lat)
          }
        }

        mapRef.current.fitBounds(
          [
            [minLng, minLat],
            [maxLng, maxLat],
          ],
          { padding: 80, duration: 1000, maxZoom: 16 }
        )
        return
      }
    }

    // Center to primary task
    const primaryMarker = markers.find((m) => m.id === primaryTaskId)
    if (primaryMarker?.location) {
      mapRef.current.flyTo({
        center: [primaryMarker.location.lng, primaryMarker.location.lat],
        zoom: 16,
        duration: 1000,
      })
    }
  }, [mapRef, activeBundle, allMarkersMap, markers, primaryTaskId])

  return { handleCenterToTask }
}
