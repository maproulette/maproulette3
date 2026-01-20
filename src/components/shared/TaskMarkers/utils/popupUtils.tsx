import maplibregl from 'maplibre-gl'
import { createRoot } from 'react-dom/client'
import { OverlapPopup, SingleTaskPopup } from '@/components/OverlapedMarkersPopup'
import type { TaskMarker } from '@/types/Task'

/**
 * Standard popup offset configuration for consistent positioning
 */
export const POPUP_OFFSET = {
  top: [0, 0] as [number, number],
  'top-left': [0, 0] as [number, number],
  'top-right': [0, 0] as [number, number],
  bottom: [0, -32] as [number, number],
  'bottom-left': [0, -32] as [number, number],
  'bottom-right': [0, -32] as [number, number],
  left: [0, 0] as [number, number],
  right: [0, 0] as [number, number],
} as maplibregl.Offset

/**
 * Standard popup configuration
 * Note: closeButton is set to false because we use a custom close button in the popup header
 */
export const POPUP_CONFIG = {
  closeOnClick: true,
  closeButton: false, // Using custom close button in header instead
  maxWidth: '320px',
  className: 'task-marker-popup',
  offset: POPUP_OFFSET,
} as const

/**
 * Remove all existing popups from the map
 */
export const removeAllPopups = (_map: maplibregl.Map) => {
  const existingPopups = document.querySelectorAll('.maplibregl-popup')
  existingPopups.forEach((popup) => {
    popup.remove()
  })
}

/**
 * Create and display a popup for overlapping tasks
 */
export const showOverlapPopup = (
  map: maplibregl.Map,
  coordinates: [number, number],
  tasks: TaskMarker[]
) => {
  removeAllPopups(map)

  const popupContainer = document.createElement('div')
  const popup = new maplibregl.Popup({
    ...POPUP_CONFIG,
    maxWidth: '320px',
  })
    .setLngLat(coordinates)
    .setDOMContent(popupContainer)
    .addTo(map)

  // Force popup to recalculate position after content is rendered
  requestAnimationFrame(() => {
    if (map && popup.isOpen()) {
      popup.setLngLat(coordinates)
    }
  })

  const handleClose = () => {
    popup.remove()
  }

  const root = createRoot(popupContainer)
  root.render(<OverlapPopup tasks={tasks} onClose={handleClose} />)

  popup.on('close', () => {
    root.unmount()
  })

  return popup
}

/**
 * Create and display a popup for a single task
 */
export const showSingleTaskPopup = (
  map: maplibregl.Map,
  coordinates: [number, number],
  task: TaskMarker
) => {
  removeAllPopups(map)

  const popupContainer = document.createElement('div')
  const popup = new maplibregl.Popup({
    ...POPUP_CONFIG,
    maxWidth: '260px',
  })
    .setLngLat(coordinates)
    .setDOMContent(popupContainer)
    .addTo(map)

  // Force popup to recalculate position after content is rendered
  requestAnimationFrame(() => {
    if (map && popup.isOpen()) {
      popup.setLngLat(coordinates)
    }
  })

  const handleClose = () => {
    popup.remove()
  }

  const root = createRoot(popupContainer)
  root.render(<SingleTaskPopup taskId={task.id} map={map} onClose={handleClose} />)

  popup.on('close', () => {
    root.unmount()
  })

  return popup
}

/**
 * Extract task markers from GeoJSON features
 */
export const extractTaskMarkersFromFeatures = (
  features: GeoJSON.Feature[],
  overlapId: string
): TaskMarker[] => {
  const uniqueTasksMap = new Map<string, TaskMarker>()

  features
    .filter((f) => f.properties?.overlapId === overlapId)
    .forEach((f) => {
      const taskId = String(f.properties?.id)
      if (!uniqueTasksMap.has(taskId)) {
        const geometry = f.geometry as GeoJSON.Point
        uniqueTasksMap.set(taskId, {
          id: Number(taskId),
          status: Number(f.properties?.status ?? 0),
          priority: Number(f.properties?.priority ?? 0),
          location: {
            lng: geometry.coordinates[0],
            lat: geometry.coordinates[1],
          },
        })
      }
    })

  return Array.from(uniqueTasksMap.values())
}
