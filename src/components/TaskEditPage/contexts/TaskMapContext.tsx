import type { ReactNode } from 'react'
import { createContext, useContext, useRef, useState } from 'react'
import type { MapRef } from 'react-map-gl/maplibre'

export interface TaskMapContextType {
  map: React.RefObject<MapRef | null>
  mapLoaded: boolean
  setMapLoaded: (loaded: boolean) => void
}

const TaskMapContext = createContext<TaskMapContextType | undefined>(undefined)

export const TaskMapProvider = ({ children }: { children: ReactNode }) => {
  const mapRef = useRef<MapRef | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  const value: TaskMapContextType = {
    map: mapRef,
    mapLoaded,
    setMapLoaded,
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
