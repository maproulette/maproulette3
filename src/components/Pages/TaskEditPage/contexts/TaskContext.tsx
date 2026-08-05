import { useLoaderData } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/api'
import { useAuthContext } from '@/contexts/AuthContext'
import { useWebSocketContext } from '@/contexts/WebSocketContext'
import { useIntl } from '@/i18n'
import { getLockConflictInfo, type LockConflictInfo } from '@/lib/apiError'
import { logger } from '@/lib/logger'
import type { Task } from '@/types/Task'
import type { TaskEventMessage, TasksEventMessage } from '@/types/WebSocket'
import { LockConflictDialog } from './LockConflictDialog'

// Statuses that allow editing: Created (0), Skipped (3), Too Hard/Can't Complete (6)
export const EDITABLE_STATUSES = [0, 3, 6]

export interface TaskContextType {
  task: Task
  isLocked: boolean
  isLocking: boolean
  lockedTasks: number[]
  lockTask: () => void
  unlockTask: () => void
}

export const TaskContext = createContext<TaskContextType | undefined>(undefined)

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const { task: loaderTask, challenge } = useLoaderData({ from: '/_app/tasks/$taskId/' })
  const { data: liveTask } = api.task.getTask(loaderTask.id)
  const task = liveTask ?? loaderTask
  const { user, isAuthenticated } = useAuthContext()
  const { lastMessage } = useWebSocketContext()
  const { t } = useIntl()
  const lockTaskMutation = api.task.useLockTask()
  const unlockTaskMutation = api.task.useUnlockTask()
  const hasAttemptedLock = useRef(false)
  const [isLocked, setIsLocked] = useState(false)
  const [lockedTasks, setLockedTasks] = useState<number[]>([])
  const [lockConflict, setLockConflict] = useState<LockConflictInfo | null>(null)

  const lockedTaskIdRef = useRef<number | null>(null)

  const attemptLock = useCallback(
    (taskId: number) => {
      lockTaskMutation.mutate(taskId, {
        onSuccess: (data) => {
          setIsLocked(true)
          lockedTaskIdRef.current = taskId
          setLockedTasks(data.lockBundledTasks.filter((id) => id !== taskId))
        },
        onError: async (error) => {
          setIsLocked(false)
          const conflict = await getLockConflictInfo(error)
          if (conflict) {
            setLockConflict(conflict)
            return
          }
          logger.error('Failed to lock task', { taskId, error })
          toast.error(
            t(
              'taskEditPage.taskActions.lockButton.lockConflict',
              undefined,
              'This task is currently locked by another mapper. Try again later or pick a different task.'
            )
          )
        },
      })
    },
    [lockTaskMutation, t]
  )

  useEffect(() => {
    hasAttemptedLock.current = false
    setIsLocked(false)
    setLockedTasks([])
    setLockConflict(null)
  }, [task?.id])

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
  }, [unlockTaskMutation.mutate])

  useEffect(() => {
    if (!task || !lastMessage || typeof lastMessage !== 'object') return
    const message = lastMessage as Partial<TaskEventMessage>
    if (message.messageType !== 'task-released' && message.messageType !== 'task-claimed') return
    if (message.data?.task?.id !== task.id) return

    if (message.messageType === 'task-released') {
      setIsLocked(false)
      setLockedTasks([])
      lockedTaskIdRef.current = null
      return
    }

    const claimedByMe = message.data.byUser == null || message.data.byUser.userId === user?.id
    setIsLocked(claimedByMe)
    if (!claimedByMe) {
      lockedTaskIdRef.current = null
    }
  }, [lastMessage, task, user?.id])

  useEffect(() => {
    if (!task || !lastMessage || typeof lastMessage !== 'object') return
    const message = lastMessage as Partial<TasksEventMessage>
    if (message.messageType !== 'tasks-claimed' && message.messageType !== 'tasks-released') return
    const tasks = message.data?.tasks
    if (!tasks?.some((t) => t.id === task.id)) return
    const byMe = message.data?.byUser == null || message.data.byUser.userId === user?.id
    if (!byMe) return

    if (message.messageType === 'tasks-released') {
      setLockedTasks([])
      return
    }

    setLockedTasks(tasks.map((t) => t.id).filter((id) => id !== task.id))
    setIsLocked(true)
  }, [lastMessage, task, user?.id])

  useEffect(() => {
    if (isLocked && lockConflict) {
      setLockConflict(null)
    }
  }, [isLocked, lockConflict])

  const lockTask = useCallback(() => {
    if (!task || challenge?.paused) return
    attemptLock(task.id)
  }, [task, challenge?.paused, attemptLock])

  const unlockTask = useCallback(() => {
    if (!task) return
    unlockTaskMutation.mutate(task.id, {
      onSuccess: () => {
        setIsLocked(false)
        setLockedTasks([])
        if (lockedTaskIdRef.current === task.id) {
          lockedTaskIdRef.current = null
        }
      },
    })
  }, [task, unlockTaskMutation])

  const handleConfirmSwitchLock = useCallback(() => {
    if (!task || !lockConflict) return
    unlockTaskMutation.mutate(lockConflict.lockedTaskId, {
      onSettled: () => {
        setLockConflict(null)
        attemptLock(task.id)
      },
    })
  }, [task, lockConflict, unlockTaskMutation, attemptLock])

  const value: TaskContextType = useMemo(
    () => ({
      task,
      isLocked,
      isLocking: lockTaskMutation.isPending,
      lockedTasks,
      lockTask,
      unlockTask,
    }),
    [task, isLocked, lockTaskMutation.isPending, lockedTasks, lockTask, unlockTask]
  )

  return (
    <TaskContext.Provider value={value}>
      {children}
      <LockConflictDialog
        conflict={lockConflict}
        onOpenChange={(open) => {
          if (!open) setLockConflict(null)
        }}
        onConfirm={handleConfirmSwitchLock}
        busy={unlockTaskMutation.isPending}
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
