import maplibregl from 'maplibre-gl'
import { createRoot, type Root } from 'react-dom/client'
import { createPortal } from 'react-dom'
import { OverlapPopup, SingleTaskPopup } from '@/components/OverlapedMarkersPopup'
import type { TaskMarker, Task, TaskGetResponse } from '@/types/Task'
import { apiRequest } from '@/api'
import React from 'react'

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
  closeButton: false,
  maxWidth: '320px',
  className: 'task-marker-popup',
  offset: POPUP_OFFSET,
} as const

/**
 * Track active popup instances and their React roots for proper cleanup
 */
const activePopups = new Map<maplibregl.Popup, Root>()

/**
 * Remove all existing popups from the map and clean up React roots
 */
export const removeAllPopups = (_map: maplibregl.Map) => {
  activePopups.forEach((root, popup) => {
    try {
      if (popup.isOpen()) {
        popup.remove()
      }
      root.unmount()
    } catch (_error) {}
  })
  activePopups.clear()

  const existingPopups = document.querySelectorAll('.maplibregl-popup')
  existingPopups.forEach((popupElement) => {
    popupElement.remove()
  })
}

/**
 * Shared helper to create and display a popup with React content
 */
const createPopup = (
  map: maplibregl.Map,
  coordinates: [number, number],
  maxWidth: string,
  getContent: (handleClose: () => void) => React.ReactElement,
  portalTargetId?: string
): maplibregl.Popup => {
  removeAllPopups(map)

  const popupContainer = document.createElement('div')
  
  // If portal target ID is provided, create the target element in the container
  if (portalTargetId) {
    const portalTarget = document.createElement('div')
    portalTarget.id = portalTargetId
    popupContainer.appendChild(portalTarget)
  }

  const popup = new maplibregl.Popup({
    ...POPUP_CONFIG,
    maxWidth,
  })
    .setLngLat(coordinates)
    .setDOMContent(popupContainer)
    .addTo(map)

  requestAnimationFrame(() => {
    if (map && popup.isOpen()) {
      popup.setLngLat(coordinates)
    }
  })

  const handleClose = () => {
    if (popup.isOpen()) {
      popup.remove()
    }
    const popupRoot = activePopups.get(popup)
    if (popupRoot) {
      popupRoot.unmount()
      activePopups.delete(popup)
    }
  }

  const root = createRoot(popupContainer)
  activePopups.set(popup, root)
  root.render(getContent(handleClose))

  popup.on('close', () => {
    const popupRoot = activePopups.get(popup)
    if (popupRoot) {
      popupRoot.unmount()
      activePopups.delete(popup)
    }
  })

  return popup
}

/**
 * Create popup container with portal target element
 * Used when rendering popup content via React portal
 */
export const createPopupContainer = (
  map: maplibregl.Map,
  coordinates: [number, number],
  portalTargetId: string
): maplibregl.Popup => {
  removeAllPopups(map)

  const popupContainer = document.createElement('div')
  const portalTarget = document.createElement('div')
  portalTarget.id = portalTargetId
  popupContainer.appendChild(portalTarget)

  const popup = new maplibregl.Popup({
    ...POPUP_CONFIG,
    maxWidth: '260px',
  })
    .setLngLat(coordinates)
    .setDOMContent(popupContainer)
    .addTo(map)

  // Ensure popup is visible and element is accessible
  requestAnimationFrame(() => {
    if (map && popup.isOpen()) {
      popup.setLngLat(coordinates)
      // Verify element exists after popup is added
      const element = document.getElementById(portalTargetId)
      if (!element) {
        console.warn('Portal target element not found after popup creation:', portalTargetId)
      }
    }
  })

  popup.on('close', () => {
    // Portal cleanup handled by React
  })

  return popup
}

/**
 * Create and display a popup for overlapping tasks
 */
export const showOverlapPopup = (
  map: maplibregl.Map,
  coordinates: [number, number],
  tasks: TaskMarker[]
) => {
  return createPopup(map, coordinates, '320px', (handleClose) => (
    <OverlapPopup tasks={tasks} onClose={handleClose} />
  ))
}

/**
 * Create and display a popup for a single task
 * Fetches task data before opening the popup
 */
export const showSingleTaskPopup = async (
  map: maplibregl.Map,
  coordinates: [number, number],
  task: TaskMarker
) => {

  // Fetch task data before creating the popup
  let taskData: Task | undefined
  try {
    // Fetch task data directly using apiRequest (same as queryFn does)
    const response = await apiRequest
      .get(`api/v2/task/${task.id}?mapillary=false`)
      .json<TaskGetResponse>()
    taskData = response
  } catch (error) {
    console.error('Error fetching task data:', error)
    // Continue to show popup even if fetch fails - it will handle the error state
  }

  return createPopup(map, coordinates, '260px', (handleClose) => {
    // Find the target element for the portal (created in popup container)
    const portalElement = document.getElementById('maplibre-popup-identifier')
    
    if (portalElement) {
      // Use portal to render into the target element
      return createPortal(
        <SingleTaskPopup taskId={task.id} map={map} onClose={handleClose} initialTaskData={taskData} idenifier="maplibre-popup-identifier" />,
        portalElement
      )
    }
    
    // Fallback: render normally if portal target doesn't exist
    return <SingleTaskPopup taskId={task.id} map={map} onClose={handleClose} initialTaskData={taskData} idenifier="maplibre-popup-identifier" />
  }, 'maplibre-popup-identifier')
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
