import type { ReactNode } from 'react'
import { createContext, useContext, useRef, useState } from 'react'
import type { MapRef } from 'react-map-gl/maplibre'
import type { TaskMarker } from '@/types/Task'

export interface TaskMapContextType {
  map: React.RefObject<MapRef | null>
  mapLoaded: boolean
  setMapLoaded: (loaded: boolean) => void
  selectedMarker: TaskMarker | null
  setSelectedMarker: (marker: TaskMarker | null) => void
  markersHidden: boolean
  setMarkersHidden: (hidden: boolean) => void
}

const TaskMapContext = createContext<TaskMapContextType | undefined>(undefined)

export const TaskMapProvider = ({ children }: { children: ReactNode }) => {
  const mapRef = useRef<MapRef | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [selectedMarker, setSelectedMarker] = useState<TaskMarker | null>(null)
  const [markersHidden, setMarkersHidden] = useState(false)

  const value: TaskMapContextType = {
    map: mapRef,
    mapLoaded,
    setMapLoaded,
    selectedMarker,
    setSelectedMarker,
    markersHidden,
    setMarkersHidden,
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
