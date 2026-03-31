import { useLoaderData } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { api } from '@/api'
import { useAuthContext } from '@/contexts/AuthContext'
import type { Task } from '@/types/Task'

// Statuses that allow editing: Created (0), Skipped (3), Too Hard/Can't Complete (6)
export const EDITABLE_STATUSES = [0, 3, 6]

export interface TaskContextType {
  task: Task
  isLocked: boolean
  isLocking: boolean
  lockTask: () => void
  unlockTask: () => void
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const loaderData = useLoaderData({ from: '/_app/tasks/$taskId/' })
  const { isAuthenticated } = useAuthContext()
  const lockTaskMutation = api.task.useLockTask()
  const unlockTaskMutation = api.task.useUnlockTask()
  const hasAttemptedLock = useRef(false)
  const [isLocked, setIsLocked] = useState(false)

  const task = loaderData?.task as Task | undefined

  // Automatically lock task when page loads (only for editable statuses)
  useEffect(() => {
    if (!task || !isAuthenticated || hasAttemptedLock.current) return
    if (!EDITABLE_STATUSES.includes(task.status ?? 0)) return

    hasAttemptedLock.current = true
    lockTaskMutation.mutate(task.id, {
      onSuccess: () => setIsLocked(true),
      onError: () => setIsLocked(false),
    })
  }, [task, isAuthenticated, lockTaskMutation])

  // Reset lock state when task changes
  useEffect(() => {
    hasAttemptedLock.current = false
    setIsLocked(false)
  }, [task?.id])

  const lockTask = () => {
    if (!task) return
    lockTaskMutation.mutate(task.id, {
      onSuccess: () => setIsLocked(true),
    })
  }

  const unlockTask = () => {
    if (!task) return
    unlockTaskMutation.mutate(task.id, {
      onSuccess: () => setIsLocked(false),
    })
  }

  if (!loaderData) {
    return <Loader2 className="h-4 w-4 animate-spin" />
  }

  const value: TaskContextType = {
    task: task as Task,
    isLocked,
    isLocking: lockTaskMutation.isPending,
    lockTask,
    unlockTask,
  }

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}

export const useTaskContext = () => {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error('useTask must be used within an TaskProvider')
  }
  return context
}
