import { useQuery } from '@tanstack/react-query'
import { createContext, type ReactNode, useCallback, useContext, useMemo } from 'react'
import { api } from '@/api'
import type { TaskCluster, TaskMarker } from '@/types/Task'
import { getMapBoundsString } from '@/utils/mapUtils'
import { useExploreChallengesSearchContext } from '../ExploreChallengesSearchContext'
import { useExploreChallengesMapContext } from './ExploreChallengesMapContext'

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
  const { taskMarkerParams, setBounds, isLocationLoading } = useExploreChallengesSearchContext()
  const { map } = useExploreChallengesMapContext()

  const { data, isFetching, error } = useQuery({
    ...api.task.getTaskMarkers(taskMarkerParams),
    enabled: !isLocationLoading,
  })

  const setMapBounds = useCallback(() => {
    if (!map.current) return
    const boundsString = getMapBoundsString(map.current)
    setBounds(boundsString)
  }, [map, setBounds])

  // Memoize taskMarkers transformation to prevent unnecessary rerenders
  const taskMarkers = useMemo<TaskMarker[] | undefined>(() => {
    if (!data?.tasks) return undefined
    return data.tasks.map((task) => ({
      ...task,
      priority: task.priority ?? 0,
    }))
  }, [data?.tasks])

  // Memoize the entire context value to prevent unnecessary rerenders
  const value = useMemo<ChallengeTaskMarkersContextType>(
    () => ({
      taskMarkers,
      clusters: data?.clusters || undefined,
      totalCount: data?.totalCount || 0,
      dataLoading: isFetching || isLocationLoading,
      dataError: error,
      setMapBounds,
    }),
    [taskMarkers, data?.clusters, data?.totalCount, isFetching, isLocationLoading, error, setMapBounds]
  )

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
