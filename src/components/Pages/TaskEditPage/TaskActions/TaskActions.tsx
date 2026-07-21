import type { VariantProps } from 'class-variance-authority'
import { CheckCircle2, Flag, LogIn, X } from 'lucide-react'
import { type ReactNode, useEffect, useState } from 'react'
import { useChallengeContext } from '@/components/Pages/TaskEditPage/contexts/ChallengeContext'
import {
  EDITABLE_STATUSES,
  useTaskContext,
} from '@/components/Pages/TaskEditPage/contexts/TaskContext'
import { Button, type buttonVariants } from '@/components/ui/Button'
import { DisabledTooltip } from '@/components/ui/DisabledTooltip'
import { useAuthContext } from '@/contexts/AuthContext'
import { TaskActionModal } from '../TaskActionModal'
import { NavigationActions } from './NavigationActions'
import { StartMappingActions } from './StartMappingActions'

const PAUSED_MESSAGE =
  'This challenge is currently paused. Tasks cannot be completed until it is resumed.'

export const TaskActions = () => {
  const { task, isLocked } = useTaskContext()
  const { challenge } = useChallengeContext()
  const { isAuthenticated, login } = useAuthContext()
  const isPaused = challenge.paused
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
    openModal(6, "Can't Complete")
  }

  const handleMarkAsAlreadyFixed = () => {
    openModal(5, 'Already Fixed')
  }

  const completionActions: Array<{
    variant: VariantProps<typeof buttonVariants>['variant']
    icon: ReactNode
    onClick: () => void
    title: string
    label: string
  }> = [
    {
      variant: 'success',
      icon: <CheckCircle2 />,
      onClick: handleMarkAsFixed,
      title: 'Mark as Fixed (Ctrl/Cmd + F)',
      label: 'Fixed',
    },
    {
      variant: 'info',
      icon: <CheckCircle2 />,
      onClick: handleMarkAsAlreadyFixed,
      title: 'Mark as Already Fixed',
      label: 'Already Fixed',
    },
    {
      variant: 'warning',
      icon: <Flag />,
      onClick: handleMarkAsFalsePositive,
      title: 'Mark as False Positive (Ctrl/Cmd + P)',
      label: 'Not an Issue',
    },
    {
      variant: 'caution',
      icon: <X />,
      onClick: handleMarkAsTooHard,
      title: "Mark as Can't Complete",
      label: "Can't Complete",
    },
  ]

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

      if (isModalOpen || isPaused) return

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
  }, [isModalOpen, isLocked, isPaused])

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
          Completion: Set Task Status
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {completionActions.map((action) => (
            <DisabledTooltip key={action.label} show={isPaused} message={PAUSED_MESSAGE}>
              <Button
                variant={action.variant}
                size="sm"
                onClick={action.onClick}
                title={action.title}
                disabled={isPaused}
                className="w-full"
              >
                {action.icon}
                {action.label}
              </Button>
            </DisabledTooltip>
          ))}
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
