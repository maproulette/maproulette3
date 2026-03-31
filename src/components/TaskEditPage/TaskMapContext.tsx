import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useRef, useState } from 'react'
import type { MapMouseEvent, MapRef } from 'react-map-gl/maplibre'
import type { TaskMarker } from '@/types/Task'
import { useLassoEvents } from './TaskMap/useLassoEvents'

export const MAX_SELECTED_TASKS = 50

export type LassoMode = 'select' | 'deselect' | null

export interface TaskMapContextType {
  map: React.RefObject<MapRef | null>
  mapLoaded: boolean
  setMapLoaded: (loaded: boolean) => void
  selectedMarker: TaskMarker | null
  setSelectedMarker: (marker: TaskMarker | null) => void
  markersHidden: boolean
  setMarkersHidden: (hidden: boolean) => void
  activeTaskId: number | null
  setActiveTaskId: (taskId: number | null) => void
  emptyClickCount: number
  triggerEmptyClick: () => void

  // Lasso selection state
  drawingMode: LassoMode
  setDrawingMode: (mode: LassoMode) => void
  isDrawing: boolean
  setIsDrawing: (drawing: boolean) => void
  lassoPolygon: [number, number][] | null
  setLassoPolygon: (polygon: [number, number][] | null) => void
  selectedTaskIds: Set<number>
  setSelectedTaskIds: React.Dispatch<React.SetStateAction<Set<number>>>
  isAtSelectionLimit: boolean

  // Lasso actions
  startDrawing: (mode: 'select') => void
  cancelDrawing: () => void
  clearSelection: () => void
  onMapClick: (e: MapMouseEvent) => void
  onMouseMove: (e: MapMouseEvent) => void
}

const TaskMapContext = createContext<TaskMapContextType | undefined>(undefined)

export const TaskMapProvider = ({ children }: { children: ReactNode }) => {
  const mapRef = useRef<MapRef | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [selectedMarker, setSelectedMarker] = useState<TaskMarker | null>(null)
  const [markersHidden, setMarkersHidden] = useState(false)
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null)
  const [emptyClickCount, setEmptyClickCount] = useState(0)

  // Lasso state
  const [drawingMode, setDrawingMode] = useState<LassoMode>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lassoPolygon, setLassoPolygon] = useState<[number, number][] | null>(null)
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<number>>(new Set())

  const currentModeRef = useRef<LassoMode>(null)

  const triggerEmptyClick = () => {
    setEmptyClickCount((prev) => prev + 1)
  }

  const startDrawing = useCallback((mode: 'select') => {
    currentModeRef.current = mode
    setDrawingMode(mode)
  }, [])

  const cancelDrawing = useCallback(() => {
    if (mapRef.current) {
      const map = mapRef.current.getMap()
      if (map?.dragPan) {
        map.dragPan.enable()
      }
    }
    currentModeRef.current = null
    setDrawingMode(null)
    setLassoPolygon(null)
    setIsDrawing(false)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedTaskIds(new Set())
  }, [])

  const isAtSelectionLimit = selectedTaskIds.size >= MAX_SELECTED_TASKS

  useLassoEvents()

  const onMapClick = (e: MapMouseEvent) => {
    if (!drawingMode) {
      handleMapClick(e)
    }
  }

  const onMouseMove = (e: MapMouseEvent) => {
    if (!drawingMode) {
      handleMapMouseMove(e)
    }
  }

  const value: TaskMapContextType = {
    map: mapRef,
    mapLoaded,
    setMapLoaded,
    selectedMarker,
    setSelectedMarker,
    markersHidden,
    setMarkersHidden,
    activeTaskId,
    setActiveTaskId,
    emptyClickCount,
    triggerEmptyClick,
    drawingMode,
    setDrawingMode,
    isDrawing,
    setIsDrawing,
    lassoPolygon,
    setLassoPolygon,
    selectedTaskIds,
    setSelectedTaskIds,
    isAtSelectionLimit,
    startDrawing,
    cancelDrawing,
    clearSelection,
    onMapClick,
    onMouseMove,
  }

  return <TaskMapContext.Provider value={value}>{children}</TaskMapContext.Provider>
}

export const useTaskMapContext = () => {
  const context = useContext(TaskMapContext)
  if (context === undefined) {
    throw new Error('useTaskMapContext must be used within a TaskMapProvider')
  }
  return context
}
