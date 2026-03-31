import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  CheckCircle2,
  Flag,
  Loader2,
  LogIn,
  MapPin,
  Navigation,
  Shuffle,
  SkipForward,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/api'
import { Button } from '@/components/ui/Button'
import { useAuthContext } from '@/contexts/AuthContext'
import type { Task } from '@/types/Task'
import { EDITABLE_STATUSES, useTaskContext } from '@/components/TaskEditPage/TaskContext'
import { TaskActionModal } from '../TaskActionModal'

export const SkipButton = ({ task }: { task: Task }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className="gap-1.5 rounded-full border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
        title="Skip this task"
      >
        <SkipForward className="h-3.5 w-3.5" />
        Skip this task
      </Button>
      <TaskActionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        task={task}
        initialStatus={3}
      />
    </>
  )
}

const StartMappingActions = ({
  isLocking,
  lockTask,
  challengeId,
}: {
  isLocking: boolean
  lockTask: () => void
  challengeId: number
}) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isLoadingNext, setIsLoadingNext] = useState(false)

  const handleGoToDifferentTask = async () => {
    setIsLoadingNext(true)
    try {
      const randomTasks = await api.challenge.getRandomTask(challengeId, queryClient)
      if (randomTasks && randomTasks.length > 0) {
        await navigate({ to: '/tasks/$taskId', params: { taskId: String(randomTasks[0].id) } })
      } else {
        toast.info('No more tasks available in this challenge')
        await navigate({
          to: '/challenge/$challengeId',
          params: { challengeId: String(challengeId) },
        })
      }
    } catch {
      toast.error('Failed to load next task')
    } finally {
      setIsLoadingNext(false)
    }
  }

  return (
    <div className="rounded-lg bg-zinc-100 p-1.5 dark:bg-slate-800/60">
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={lockTask}
          disabled={isLocking}
          className="flex items-center justify-center gap-2 rounded-md bg-green-600 px-3 py-3 font-medium text-sm text-white shadow-sm transition-colors hover:bg-green-700 disabled:opacity-50 dark:bg-green-600 dark:hover:bg-green-500"
        >
          {isLocking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
          {isLocking ? 'Starting...' : 'Map this task'}
        </button>
        <button
          type="button"
          onClick={handleGoToDifferentTask}
          disabled={isLoadingNext}
          className="flex items-center justify-center gap-2 rounded-md bg-zinc-600 px-3 py-3 font-medium text-sm text-white shadow-sm transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-slate-700 dark:hover:bg-slate-600"
        >
          {isLoadingNext ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Shuffle className="h-4 w-4" />
          )}
          {isLoadingNext ? 'Loading...' : 'Different task'}
        </button>
      </div>
    </div>
  )
}

const NavigationActions = ({ challengeId, taskId }: { challengeId: number; taskId: number }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isLoadingNearby, setIsLoadingNearby] = useState(false)
  const [isLoadingRandom, setIsLoadingRandom] = useState(false)

  const handleGoToNearbyTask = async () => {
    setIsLoadingNearby(true)
    try {
      const nearbyTasks = await queryClient.fetchQuery({
        queryKey: ['tasksNearby', challengeId, taskId, 1],
        queryFn: () => api.challenge.fetchTasksNearby(challengeId, taskId, 1),
      })
      if (nearbyTasks && nearbyTasks.length > 0) {
        await navigate({ to: '/tasks/$taskId', params: { taskId: String(nearbyTasks[0].id) } })
      } else {
        toast.info('No nearby tasks available')
      }
    } catch {
      toast.error('Failed to load nearby task')
    } finally {
      setIsLoadingNearby(false)
    }
  }

  const handleGoToRandomTask = async () => {
    setIsLoadingRandom(true)
    try {
      const randomTasks = await api.challenge.getRandomTask(challengeId, queryClient)
      if (randomTasks && randomTasks.length > 0) {
        await navigate({ to: '/tasks/$taskId', params: { taskId: String(randomTasks[0].id) } })
      } else {
        toast.info('No more tasks available in this challenge')
        await navigate({
          to: '/challenge/$challengeId',
          params: { challengeId: String(challengeId) },
        })
      }
    } catch {
      toast.error('Failed to load next task')
    } finally {
      setIsLoadingRandom(false)
    }
  }

  return (
    <div className="rounded-lg bg-zinc-100 p-2.5 dark:bg-slate-800/60">
      <p className="mb-2 text-center font-medium text-sm text-zinc-700 dark:text-slate-300">
        Want to map this challenge?
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={handleGoToNearbyTask}
          disabled={isLoadingNearby}
          className="flex items-center justify-center gap-2 rounded-md bg-green-600 px-3 py-3 font-medium text-sm text-white shadow-sm transition-colors hover:bg-green-700 disabled:opacity-50 dark:bg-green-600 dark:hover:bg-green-500"
        >
          {isLoadingNearby ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
          {isLoadingNearby ? 'Loading...' : 'Nearby task'}
        </button>
        <button
          type="button"
          onClick={handleGoToRandomTask}
          disabled={isLoadingRandom}
          className="flex items-center justify-center gap-2 rounded-md bg-green-600 px-3 py-3 font-medium text-sm text-white shadow-sm transition-colors hover:bg-green-700 disabled:opacity-50 dark:bg-green-600 dark:hover:bg-green-500"
        >
          {isLoadingRandom ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Shuffle className="h-4 w-4" />
          )}
          {isLoadingRandom ? 'Loading...' : 'Random task'}
        </button>
      </div>
    </div>
  )
}

export const TaskActions = () => {
  const { task, isLocked, isLocking, lockTask } = useTaskContext()
  const { isAuthenticated, login } = useAuthContext()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalConfig, setModalConfig] = useState<{
    status: number
    label: string
  } | null>(null)

  const openModal = (status: number, label: string) => {
    setModalConfig({ status, label })
    setIsModalOpen(true)
  }

  const handleMarkAsFixed = () => {
    openModal(1, 'Fixed')
  }

  const handleMarkAsFalsePositive = () => {
    openModal(2, 'False Positive')
  }

  const handleMarkAsTooHard = () => {
    openModal(5, 'Too Hard')
  }

  const handleMarkAsAlreadyFixed = () => {
    openModal(6, 'Already Fixed')
  }

  // Keyboard shortcuts - only when locked
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLocked) return

      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return
      }

      if (isModalOpen) return

      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        handleMarkAsFixed()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        handleMarkAsFalsePositive()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen, isLocked])

  // Show sign in button if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="rounded-lg bg-zinc-100 p-1.5 dark:bg-slate-800/60">
        <button
          type="button"
          onClick={login}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-green-600 px-3 py-3 font-medium text-sm text-white shadow-sm transition-colors hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500"
        >
          <LogIn className="h-4 w-4" />
          Sign in to map this task
        </button>
      </div>
    )
  }

  // Show navigation buttons for non-editable statuses (Fixed, False Positive, Deleted, Already Fixed)
  if (!EDITABLE_STATUSES.includes(task.status ?? 0)) {
    return <NavigationActions challengeId={task.parent} taskId={task.id} />
  }

  // Show start mapping button if not locked
  if (!isLocked) {
    return (
      <StartMappingActions isLocking={isLocking} lockTask={lockTask} challengeId={task.parent} />
    )
  }

  // Show completion buttons when locked
  return (
    <>
      <div className="rounded-lg bg-zinc-100 p-1.5 dark:bg-slate-800/60">
        <div className="mb-1.5 px-1 font-medium text-[10px] text-zinc-500 uppercase tracking-wider dark:text-slate-400">
          Completion
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={handleMarkAsFixed}
            className="flex items-center justify-center gap-1.5 rounded-md bg-green-600 px-3 py-2 font-medium text-white text-xs shadow-sm transition-colors hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500"
            title="Mark as Fixed (Ctrl/Cmd + F)"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Fixed
          </button>

          <button
            type="button"
            onClick={handleMarkAsAlreadyFixed}
            className="flex items-center justify-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 font-medium text-white text-xs shadow-sm transition-colors hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
            title="Mark as Already Fixed"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Already Fixed
          </button>

          <button
            type="button"
            onClick={handleMarkAsFalsePositive}
            className="flex items-center justify-center gap-1.5 rounded-md bg-yellow-600 px-3 py-2 font-medium text-white text-xs shadow-sm transition-colors hover:bg-yellow-700 dark:bg-yellow-600 dark:hover:bg-yellow-500"
            title="Mark as False Positive (Ctrl/Cmd + P)"
          >
            <Flag className="h-3.5 w-3.5" />
            Not an Issue
          </button>

          <button
            type="button"
            onClick={handleMarkAsTooHard}
            className="flex items-center justify-center gap-1.5 rounded-md bg-orange-600 px-3 py-2 font-medium text-white text-xs shadow-sm transition-colors hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-500"
            title="Mark as Too Hard"
          >
            <X className="h-3.5 w-3.5" />
            Can't Complete
          </button>
        </div>
      </div>

      {modalConfig && (
        <TaskActionModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          task={task}
          initialStatus={modalConfig.status}
        />
      )}
    </>
  )
}
