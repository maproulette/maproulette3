import { useLoaderData } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '@/api'
import { useAuthContext } from '@/contexts/AuthContext'
import { useLockConflict } from '@/hooks/useLockConflict'
import type { Task } from '@/types/Task'
import { LockConflictModal } from '../TaskActions/LockConflictModal'

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
  const { task, challenge } = useLoaderData({ from: '/_app/tasks/$taskId/' })
  const { isAuthenticated } = useAuthContext()
  const lockTaskMutation = api.task.useLockTask()
  const unlockTaskMutation = api.task.useUnlockTask()
  const lockConflict = useLockConflict()
  const hasAttemptedLock = useRef(false)
  const [isLocked, setIsLocked] = useState(false)

  const lockedTaskIdRef = useRef<number | null>(null)

  useEffect(() => {
    hasAttemptedLock.current = false
    setIsLocked(false)
  }, [task?.id])

  // Shared by the auto-lock effect and the manual lockTask() call so both go through the
  // same conflict handling: on a 409 (user already holds a different lock), the
  // LockConflictModal is shown and this same taskId is retried if they confirm.
  const attemptLock = useCallback(
    (taskId: number) => {
      lockTaskMutation.mutate(taskId, {
        onSuccess: () => {
          setIsLocked(true)
          lockedTaskIdRef.current = taskId
        },
        onError: async (error) => {
          const handled = await lockConflict.handleError(error, () => attemptLock(taskId))
          if (!handled) setIsLocked(false)
        },
      })
    },
    [lockTaskMutation, lockConflict]
  )

  useEffect(() => {
    if (!task || !isAuthenticated || hasAttemptedLock.current) return
    if (!EDITABLE_STATUSES.includes(task.status ?? 0)) return
    if (challenge?.paused) return

    hasAttemptedLock.current = true
    attemptLock(task.id)
  }, [task, isAuthenticated, challenge?.paused, attemptLock])

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
    if (!task || challenge?.paused) return
    attemptLock(task.id)
  }, [task, challenge?.paused, attemptLock])

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

  return (
    <TaskContext.Provider value={value}>
      {children}
      <LockConflictModal
        conflict={lockConflict.conflict}
        onConfirm={lockConflict.confirm}
        onCancel={lockConflict.cancel}
        busy={lockConflict.isReleasing}
      />
    </TaskContext.Provider>
  )
}

export const useTaskContext = () => {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error('useTask must be used within an TaskProvider')
  }
  return context
}
