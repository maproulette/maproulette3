import { useQuery } from '@tanstack/react-query'
import { createContext, type ReactNode, useCallback, useContext, useEffect } from 'react'
import { api } from '@/api'
import type { TaskCluster, TaskMarker, TaskMarkersParams } from '@/types/Task'
import { getMapBoundsString } from '@/utils/mapUtils'
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
  const { taskMarkerParams, setTaskMarkerParams, isLocationLoading } = useSearchContext()
  const { map } = useMapContext()

  const { data, isFetching, error, refetch } = useQuery({
    ...api.task.getTaskMarkers(taskMarkerParams),
    enabled: !isLocationLoading,
  })

  useEffect(() => {
    if (!isLocationLoading) {
      refetch()
    }
  }, [taskMarkerParams, refetch, isLocationLoading])

  const setMapBounds = useCallback(() => {
    if (!map.current) return
    const boundsString = getMapBoundsString(map.current)
    setTaskMarkerParams((prev: TaskMarkersParams) => ({ ...prev, bounds: boundsString }))
  }, [map, setTaskMarkerParams])

  const value: ChallengeTaskMarkersContextType = {
    taskMarkers: data?.tasks || undefined,
    clusters: data?.clusters || undefined,
    totalCount: data?.totalCount || 0,
    dataLoading: isFetching || isLocationLoading,
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
