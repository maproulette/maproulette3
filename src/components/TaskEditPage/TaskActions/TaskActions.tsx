import { CheckCircle2, Flag, LogIn, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { EDITABLE_STATUSES, useTaskContext } from '@/components/TaskEditPage/TaskContext'
import { useAuthContext } from '@/contexts/AuthContext'
import { TaskActionModal } from '../TaskActionModal'
import { NavigationActions } from './NavigationActions'
import { StartMappingActions } from './StartMappingActions'

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
