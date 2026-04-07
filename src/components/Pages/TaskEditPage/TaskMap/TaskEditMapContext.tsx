import type maplibregl from 'maplibre-gl'
import { createContext, type ReactNode, useContext } from 'react'
import type { MapMouseEvent, MapRef } from 'react-map-gl/maplibre'
import { useTaskBundleContext } from '@/components/Pages/TaskEditPage/contexts/TaskBundleContext'
import type { TaskMarker } from '@/types/Task'
import { useTaskEditMap } from './hooks'

interface TaskEditMapContextType {
  mapRef: React.RefObject<MapRef | null>
  mapLoaded: boolean
  setMapLoaded: (loaded: boolean) => void
  isStylePanelOpen: boolean
  setIsStylePanelOpen: (open: boolean) => void
  defaultStyle: string | maplibregl.StyleSpecification
  taskCount: number
  shouldCluster: boolean
  markersData: {
    markers: TaskMarker[]
    overlapMarkers: Array<{
      location: { lng: number; lat: number }
      tasks: TaskMarker[]
    }>
  }
  overlapData: {
    overlaps: Array<{
      id: string
      center: [number, number]
      tasks: TaskMarker[]
      radius: number
    }>
    nonOverlapping: never[]
  }
  isLoadingMarkers: boolean
  onMapClick: (e: MapMouseEvent) => void
  onMouseMove: (e: MapMouseEvent) => void
  isClustered: boolean
  setIsClustered: (clustered: boolean) => void
  geoJSONData: GeoJSON.FeatureCollection
  clusteredGeoJSONData: GeoJSON.FeatureCollection
  primaryTaskId: number
  spideredMarkers: Map<number, { original: [number, number]; spidered: [number, number] }>
  setSpideredMarkers: React.Dispatch<
    React.SetStateAction<Map<number, { original: [number, number]; spidered: [number, number] }>>
  >
  isClusteringForced: boolean
}

const TaskEditMapContext = createContext<TaskEditMapContextType | null>(null)

export const TaskEditMapProvider = ({ children }: { children: ReactNode }) => {
  const { showBundleOnly, activeBundle } = useTaskBundleContext()
  const value = useTaskEditMap(showBundleOnly, activeBundle)

  return <TaskEditMapContext.Provider value={value}>{children}</TaskEditMapContext.Provider>
}

export const useTaskEditMapContext = () => {
  const context = useContext(TaskEditMapContext)
  if (!context) {
    throw new Error('useTaskEditMapContext must be used within a TaskEditMapProvider')
  }
  return context
}
