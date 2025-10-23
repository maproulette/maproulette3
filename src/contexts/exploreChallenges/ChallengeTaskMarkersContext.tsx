import { useQuery } from '@tanstack/react-query'
import { createContext, type ReactNode, useCallback, useContext, useEffect } from 'react'
import { api } from '@/api'
import { useDebounce } from '@/hooks/useDebounce'
import type { MapBounds } from '@/types/Map'
import type { TaskCluster, TaskMarker, TaskMarkersParams } from '@/types/Task'
import { useMapContext } from '../MapContext'
import { useSearchContext } from './SearchContext'

type ChallengeTaskMarkersContextType = {
  taskMarkers: TaskMarker[] | undefined
  clusters: TaskCluster[] | undefined
  totalCount: number
  dataLoading: boolean
  dataError: Error | null
  setMapBounds: () => void
}

const ChallengeTaskMarkersContext = createContext<ChallengeTaskMarkersContextType | undefined>(
  undefined
)

export const ChallengeTaskMarkersProvider = ({ children }: { children: ReactNode }) => {
  const { taskMarkerParams, setTaskMarkerParams } = useSearchContext()
  const { map, mapLoaded } = useMapContext()
  const { data, isLoading, error, refetch } = useQuery(api.task.getTaskMarkers(taskMarkerParams))

  useEffect(() => {
    refetch()
  }, [taskMarkerParams, refetch])

  const setMapBounds = useCallback(() => {
    if (!map.current) return
    const bounds = map.current.getBounds()
    const boundsArray: MapBounds = [
      bounds.getSouthWest().lng,
      bounds.getSouthWest().lat,
      bounds.getNorthEast().lng,
      bounds.getNorthEast().lat,
    ]

    setTaskMarkerParams((prev: TaskMarkersParams) => ({ ...prev, bounds: boundsArray.join(',') }))
  }, [map, setTaskMarkerParams])

  const debouncedSetMapBounds = useDebounce(setMapBounds, 200)

  useEffect(() => {
    if (!mapLoaded || !map.current) return

    setMapBounds()

    map.current.on('moveend', debouncedSetMapBounds)

    return () => {
      if (map.current) {
        map.current.off('moveend', debouncedSetMapBounds)
      }
    }
  }, [mapLoaded, debouncedSetMapBounds])

  const value: ChallengeTaskMarkersContextType = {
    taskMarkers: data?.tasks || undefined,
    clusters: data?.clusters || undefined,
    totalCount: data?.totalCount || 0,
    dataLoading: isLoading,
    dataError: error,
    setMapBounds,
  }

  return (
    <ChallengeTaskMarkersContext.Provider value={value}>
      {children}
    </ChallengeTaskMarkersContext.Provider>
  )
}

export const useChallengeTaskMarkersContext = () => {
  const context = useContext(ChallengeTaskMarkersContext)

  if (context === undefined) {
    throw new Error('useChallengeTaskMarkers must be used within a ChallengeTaskMarkersProvider')
  }

  return context
}
