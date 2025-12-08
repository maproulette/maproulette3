import { useQuery } from '@tanstack/react-query'
import { createContext, type ReactNode, useCallback, useContext } from 'react'
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

  const value: ChallengeTaskMarkersContextType = {
    taskMarkers:
      data?.tasks?.map((task) => ({
        ...task,

        priority: task.priority ?? 0,
      })) || undefined,
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
