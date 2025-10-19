import maplibregl from 'maplibre-gl'
import type { TaskMarker } from '@/types/Task'

/**
 * Zoom the map to fit all task markers with appropriate padding
 */
export const zoomToTasks = (map: maplibregl.Map, markers: TaskMarker[]) => {
  if (markers.length === 0) return

  const bounds = new maplibregl.LngLatBounds()

  markers.forEach((marker) => {
    bounds.extend([marker.location.lng, marker.location.lat])
  })

  if (!bounds.isEmpty()) {
    map.fitBounds(bounds, {
      padding: 50,
      maxZoom: 16,
    })
  }
}
