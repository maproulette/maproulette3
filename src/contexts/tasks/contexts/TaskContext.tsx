import type { ReactNode } from 'react'
import { createContext, useContext } from 'react'
import { useLoaderData } from '@tanstack/react-router'
import type { Task } from '@/types/Task'

export interface TaskContextType {
  task: Task
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const loaderData = useLoaderData({ from: '/_app/tasks/$taskId/' })!
  const { task }: { task: Task } = loaderData!

  const value: TaskContextType = { task }

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}

export const useTaskContext = (): TaskContextType => {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error('useTask must be used within an TaskProvider')
  }
  return context
}
