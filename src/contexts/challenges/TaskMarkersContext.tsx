import { createContext, useContext, type ReactNode } from 'react'
import { api } from '@/api'
import { useQuery } from '@tanstack/react-query'
import { useSearchContext } from './SearchContext'
import type { TaskMarker } from '@/types/Task'

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

export const useTaskMarkersContext = (): TaskMarkersContextType => {
  const context = useContext(TaskMarkersContext)

  if (context === undefined) {
    throw new Error('useTaskMarkers must be used within a TaskMarkersProvider')
  }

  return context
}
