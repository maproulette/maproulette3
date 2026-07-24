import { useLoaderData } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
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

export const TaskContext = createContext<TaskContextType | undefined>(undefined)

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const { task } = useLoaderData({ from: '/_app/tasks/$taskId/' })
  const { isAuthenticated } = useAuthContext()
  const lockTaskMutation = api.task.useLockTask()
  const unlockTaskMutation = api.task.useUnlockTask()
  const hasAttemptedLock = useRef(false)
  const [isLocked, setIsLocked] = useState(false)

  const lockedTaskIdRef = useRef<number | null>(null)

  useEffect(() => {
    hasAttemptedLock.current = false
    setIsLocked(false)
  }, [task?.id])

  useEffect(() => {
    if (!task || !isAuthenticated || hasAttemptedLock.current) return
    if (!EDITABLE_STATUSES.includes(task.status ?? 0)) return

    hasAttemptedLock.current = true
    lockTaskMutation.mutate(task.id, {
      onSuccess: () => {
        setIsLocked(true)
        lockedTaskIdRef.current = task.id
      },
      onError: () => setIsLocked(false),
    })
  }, [task, isAuthenticated, lockTaskMutation])

  useEffect(() => {
    return () => {
      const id = lockedTaskIdRef.current
      if (id != null) {
        unlockTaskMutation.mutate(id)
        lockedTaskIdRef.current = null
      }
    }
  }, [task?.id, unlockTaskMutation])

  const lockTask = useCallback(() => {
    if (!task) return
    lockTaskMutation.mutate(task.id, {
      onSuccess: () => setIsLocked(true),
    })
  }, [task, lockTaskMutation])

  const unlockTask = useCallback(() => {
    if (!task) return
    unlockTaskMutation.mutate(task.id, {
      onSuccess: () => setIsLocked(false),
    })
  }, [task, unlockTaskMutation])

  const value: TaskContextType = useMemo(
    () => ({
      task,
      isLocked,
      isLocking: lockTaskMutation.isPending,
      lockTask,
      unlockTask,
    }),
    [task, isLocked, lockTaskMutation.isPending, lockTask, unlockTask]
  )

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}

export const useTaskContext = () => {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error('useTask must be used within an TaskProvider')
  }
  return context
}
