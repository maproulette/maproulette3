import { useQuery } from '@tanstack/react-query'
import { createContext, type ReactNode, useContext } from 'react'
import { api } from '@/api'
import type { TaskMarker } from '@/types/Task'
import { useSearchContext } from './SearchContext'

type TaskMarkersContextType = {
  taskMarkers: TaskMarker[] | undefined
  taskMarkersLoading: boolean
  taskMarkersError: Error | null
}

const TaskMarkersContext = createContext<TaskMarkersContextType | undefined>(undefined)

export const TaskMarkersProvider = ({ children }: { children: ReactNode }) => {
  const { taskMarkerParams } = useSearchContext()
  const { data, isLoading, error } = useQuery(api.task.getTaskMarkers(taskMarkerParams))

  const value: TaskMarkersContextType = {
    taskMarkers: data,
    taskMarkersLoading: isLoading,
    taskMarkersError: error,
  }

  return <TaskMarkersContext.Provider value={value}>{children}</TaskMarkersContext.Provider>
}

export const useTaskMarkersContext = () => {
  const context = useContext(TaskMarkersContext)

  if (context === undefined) {
    throw new Error('useTaskMarkers must be used within a TaskMarkersProvider')
  }

  return context
}
