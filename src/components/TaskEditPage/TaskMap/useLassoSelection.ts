import { useCallback, useEffect, useRef, useState } from 'react'
import type { MapRef } from 'react-map-gl/maplibre'
import type { TaskMarker } from '@/types/Task'
import { getTasksInBounds, getTasksInPolygon } from './lassoUtils'

export const MAX_SELECTED_TASKS = 50

export type LassoMode = 'select' | 'deselect' | null

export interface UseLassoSelectionReturn {
  // Drawing state
  drawingMode: LassoMode
  isDrawing: boolean
  lassoPolygon: [number, number][] | null

  // Selection state
  selectedTaskIds: Set<number>
  isAtSelectionLimit: boolean

  // Actions
  startDrawing: (mode: 'select') => void
  cancelDrawing: () => void

  deselectAllInView: () => void
  clearSelection: () => void

  setSelectedTaskIds: React.Dispatch<React.SetStateAction<Set<number>>>
}

export const useLassoSelection = (
  mapRef: React.RefObject<MapRef | null>,
  markers: TaskMarker[],
  primaryTaskId?: number,
  bundledTaskIds?: number[]
): UseLassoSelectionReturn => {
  // Create a set of excluded task IDs (primary + bundled)
  const excludedTaskIds = new Set<number>()
  if (primaryTaskId != null) {
    excludedTaskIds.add(primaryTaskId)
  }
  if (bundledTaskIds) {
    for (const id of bundledTaskIds) {
      excludedTaskIds.add(id)
    }
  }
  const [drawingMode, setDrawingMode] = useState<LassoMode>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lassoPolygon, setLassoPolygon] = useState<[number, number][] | null>(null)
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<number>>(new Set())

  const currentModeRef = useRef<LassoMode>(null)
  const markersRef = useRef<TaskMarker[]>(markers)
  const isMouseDownRef = useRef(false)
  const pointsRef = useRef<[number, number][]>([])

  // Keep markers ref updated
  useEffect(() => {
    markersRef.current = markers
  }, [markers])

  // Handle the lasso drawing with mouse events
  useEffect(() => {
    if (!mapRef.current || !drawingMode) return

    const map = mapRef.current.getMap()
    if (!map) return

    const canvas = map.getCanvas()

    // Helper to get canvas-relative coordinates from any mouse event
    const getCanvasCoords = (e: MouseEvent): { x: number; y: number } => {
      const rect = canvas.getBoundingClientRect()
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (!drawingMode) return

      // Only handle left mouse button
      if (e.button !== 0) return

      isMouseDownRef.current = true
      const coords = getCanvasCoords(e)
      const lngLat = map.unproject([coords.x, coords.y])
      pointsRef.current = [[lngLat.lng, lngLat.lat]]
      setLassoPolygon([[lngLat.lng, lngLat.lat]])
      setIsDrawing(true)

      // Prevent map panning while drawing
      map.dragPan.disable()
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDownRef.current || !drawingMode) return

      const coords = getCanvasCoords(e)
      const lngLat = map.unproject([coords.x, coords.y])
      const newPoint: [number, number] = [lngLat.lng, lngLat.lat]

      // Only add point if it's far enough from the last point (for performance)
      const lastPoint = pointsRef.current[pointsRef.current.length - 1]
      if (lastPoint) {
        const projected = map.project(lastPoint)
        const dx = coords.x - projected.x
        const dy = coords.y - projected.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Minimum 3 pixels between points for smooth but performant drawing
        if (distance < 3) return
      }

      pointsRef.current.push(newPoint)
      setLassoPolygon([...pointsRef.current])
    }

    const handleMouseUp = () => {
      if (!isMouseDownRef.current || !drawingMode) return

      isMouseDownRef.current = false
      map.dragPan.enable()

      // Need at least 3 points to form a polygon
      if (pointsRef.current.length >= 3) {
        // Close the polygon by adding the first point at the end
        const closedPolygon = [...pointsRef.current, pointsRef.current[0]]

        // Filter markers to only those currently visible in the map bounds
        const bounds = map.getBounds()
        const visibleMarkers = bounds
          ? markersRef.current.filter((marker) => {
              if (!marker.location) return false
              const { lng, lat } = marker.location
              return (
                lng >= bounds.getWest() &&
                lng <= bounds.getEast() &&
                lat >= bounds.getSouth() &&
                lat <= bounds.getNorth()
              )
            })
          : markersRef.current

        // Process selection - only consider visible markers
        const tasksInPolygon = getTasksInPolygon(visibleMarkers, closedPolygon)

        if (currentModeRef.current === 'select') {
          setSelectedTaskIds((prev) => {
            const newSet = new Set(prev)
            for (const taskId of tasksInPolygon) {
              // Skip primary task and bundled tasks
              if (excludedTaskIds.has(taskId)) continue
              if (newSet.size >= MAX_SELECTED_TASKS) break
              newSet.add(taskId)
            }
            return newSet
          })
        } else if (currentModeRef.current === 'deselect') {
          setSelectedTaskIds((prev) => {
            const newSet = new Set(prev)
            for (const taskId of tasksInPolygon) {
              newSet.delete(taskId)
            }
            return newSet
          })
        }
      }

      // Reset drawing state
      pointsRef.current = []
      setLassoPolygon(null)
      setIsDrawing(false)
      setDrawingMode(null)
      currentModeRef.current = null
    }

    // Mousedown on canvas only, but mousemove/mouseup on window
    // This allows dragging outside the map while lassoing
    canvas.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)

      // Re-enable drag pan on cleanup
      if (map.dragPan) {
        map.dragPan.enable()
      }
    }
  }, [mapRef, drawingMode])

  // Start drawing mode (activate the tool)
  const startDrawing = useCallback((mode: 'select' | 'deselect') => {
    currentModeRef.current = mode
    setDrawingMode(mode)
  }, [])

  // Cancel drawing and reset state
  const cancelDrawing = useCallback(() => {
    if (mapRef.current) {
      const map = mapRef.current.getMap()
      if (map?.dragPan) {
        map.dragPan.enable()
      }
    }
    isMouseDownRef.current = false
    pointsRef.current = []
    setLassoPolygon(null)
    currentModeRef.current = null
    setDrawingMode(null)
    setIsDrawing(false)
  }, [mapRef])

  // Deselect all tasks visible in current map bounds
  const deselectAllInView = useCallback(() => {
    if (!mapRef.current) return

    const map = mapRef.current.getMap()
    if (!map) return

    const bounds = map.getBounds()
    if (!bounds) return

    const boundsObj = {
      west: bounds.getWest(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      north: bounds.getNorth(),
    }

    const tasksInBounds = getTasksInBounds(markers, boundsObj)

    setSelectedTaskIds((prev) => {
      const newSet = new Set(prev)
      for (const id of tasksInBounds) {
        newSet.delete(id)
      }
      return newSet
    })
  }, [mapRef, markers])

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedTaskIds(new Set())
  }, [])

  // Handle Escape key to cancel drawing mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drawingMode) {
        cancelDrawing()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [drawingMode, cancelDrawing])

  const isAtSelectionLimit = selectedTaskIds.size >= MAX_SELECTED_TASKS

  return {
    drawingMode,
    isDrawing,
    lassoPolygon,
    selectedTaskIds,
    isAtSelectionLimit,
    startDrawing,
    cancelDrawing,
    deselectAllInView,
    clearSelection,
    setSelectedTaskIds,
  }
}
