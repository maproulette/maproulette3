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
  startDrawing: (mode: 'select' | 'deselect') => void
  cancelDrawing: () => void

  selectAllInView: () => void
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

    const handleMouseDown = (e: MouseEvent) => {
      if (!drawingMode) return

      // Only handle left mouse button
      if (e.button !== 0) return

      isMouseDownRef.current = true
      const lngLat = map.unproject([e.offsetX, e.offsetY])
      pointsRef.current = [[lngLat.lng, lngLat.lat]]
      setLassoPolygon([[lngLat.lng, lngLat.lat]])
      setIsDrawing(true)

      // Prevent map panning while drawing
      map.dragPan.disable()
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDownRef.current || !drawingMode) return

      const lngLat = map.unproject([e.offsetX, e.offsetY])
      const newPoint: [number, number] = [lngLat.lng, lngLat.lat]

      // Only add point if it's far enough from the last point (for performance)
      const lastPoint = pointsRef.current[pointsRef.current.length - 1]
      if (lastPoint) {
        const dx = e.offsetX - map.project(lastPoint).x
        const dy = e.offsetY - map.project(lastPoint).y
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

        // Process selection
        const tasksInPolygon = getTasksInPolygon(markersRef.current, closedPolygon)

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

    // Also handle mouse leaving the canvas
    const handleMouseLeave = () => {
      if (isMouseDownRef.current) {
        handleMouseUp()
      }
    }

    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('mouseleave', handleMouseLeave)

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

  // Select all tasks visible in current map bounds
  const selectAllInView = useCallback(() => {
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
        // Skip primary task and bundled tasks
        if (excludedTaskIds.has(id)) continue
        if (newSet.size >= MAX_SELECTED_TASKS) break
        newSet.add(id)
      }
      return newSet
    })
  }, [mapRef, markers])

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
    selectAllInView,
    deselectAllInView,
    clearSelection,
    setSelectedTaskIds,
  }
}
