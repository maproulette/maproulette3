import { useLoaderData } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { createContext, useContext } from 'react'
import type { Task } from '@/types/Task'
import { Loader2 } from 'lucide-react'

export interface TaskContextType {
  task: Task
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const loaderData = useLoaderData({ from: '/_app/tasks/$taskId/' })

  if (!loaderData) {
   return <Loader2 className="h-4 w-4 animate-spin" />
  }

  const { task }: { task: Task } = loaderData

  const value: TaskContextType = { task }

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}

export const useTaskContext = () => {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error('useTask must be used within an TaskProvider')
  }
  return context
}
