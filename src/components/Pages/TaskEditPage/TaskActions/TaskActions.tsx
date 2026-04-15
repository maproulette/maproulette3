import { CheckCircle2, Flag, LogIn, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  EDITABLE_STATUSES,
  useTaskContext,
} from '@/components/Pages/TaskEditPage/contexts/TaskContext'
import { Button } from '@/components/ui/Button'
import { useAuthContext } from '@/contexts/AuthContext'
import { TaskActionModal } from '../TaskActionModal'
import { NavigationActions } from './NavigationActions'
import { StartMappingActions } from './StartMappingActions'

export const TaskActions = () => {
  const { task, isLocked } = useTaskContext()
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
        <Button variant="success" size="lg" className="w-full" onClick={login}>
          <LogIn />
          Sign in to map this task
        </Button>
      </div>
    )
  }

  // Show navigation buttons for non-editable statuses (Fixed, False Positive, Deleted, Already Fixed)
  if (!EDITABLE_STATUSES.includes(task.status ?? 0)) {
    return <NavigationActions challengeId={task.parent} taskId={task.id} />
  }

  // Show start mapping button if not locked
  if (!isLocked) {
    return <StartMappingActions challengeId={task.parent} />
  }

  // Show completion buttons when locked
  return (
    <>
      <div className="rounded-lg bg-zinc-100 p-1.5 dark:bg-slate-800/60">
        <div className="mb-1.5 px-1 font-medium text-xs text-zinc-500 uppercase tracking-wider dark:text-slate-400">
          Completion
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <Button
            variant="success"
            size="sm"
            onClick={handleMarkAsFixed}
            title="Mark as Fixed (Ctrl/Cmd + F)"
          >
            <CheckCircle2 />
            Fixed
          </Button>

          <Button
            variant="info"
            size="sm"
            onClick={handleMarkAsAlreadyFixed}
            title="Mark as Already Fixed"
          >
            <CheckCircle2 />
            Already Fixed
          </Button>

          <Button
            variant="warning"
            size="sm"
            onClick={handleMarkAsFalsePositive}
            title="Mark as False Positive (Ctrl/Cmd + P)"
          >
            <Flag />
            Not an Issue
          </Button>

          <Button
            variant="caution"
            size="sm"
            onClick={handleMarkAsTooHard}
            title="Mark as Too Hard"
          >
            <X />
            Can't Complete
          </Button>
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
