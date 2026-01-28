import { CheckCircle2, Flag, SkipForward, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import type { Task } from '@/types/Task'
import { useTaskContext } from '../contexts/TaskContext'
import { TaskActionModal } from '../TaskActionModal'

export const SkipButton = ({ task }: { task: Task }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className="gap-1.5 border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800"
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

export const TaskActions = () => {
  const { task } = useTaskContext()
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [isModalOpen])

  return (
    <>
      <div className="rounded-lg bg-zinc-100 p-1.5 dark:bg-zinc-800/60">
        <div className="mb-1.5 px-1 font-medium text-[10px] text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
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
