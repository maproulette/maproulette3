import { CheckCircle2, ChevronDown, Flag, SkipForward, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { useTaskContext } from '../contexts/TaskContext'
import { TaskActionModal } from '../TaskActionModal'
import { EditorButton } from './EditorButton'

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

  const handleSkipTask = () => {
    openModal(3, 'Skipped')
  }

  const handleMarkAsFixed = () => {
    openModal(1, 'Fixed')
  }

  const handleMarkAsFalsePositive = () => {
    openModal(2, 'False Positive')
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return
      }

      // Skip if a modal/dialog is open
      if (isModalOpen) {
        return
      }

      // Ctrl/Cmd + S = Skip task
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSkipTask()
      }
      // Ctrl/Cmd + F = Mark as Fixed
      else if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        handleMarkAsFixed()
      }
      // Ctrl/Cmd + P = Mark as False Positive
      else if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        handleMarkAsFalsePositive()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen])

  const handleMarkAsTooHard = () => {
    openModal(5, 'Too Hard')
  }

  const handleMarkAsAlreadyFixed = () => {
    openModal(6, 'Already Fixed')
  }

  const getStatusColor = (status: number) => {
    const colors: Record<number, string> = {
      1: 'text-green-600 dark:text-green-400',
      2: 'text-yellow-600 dark:text-yellow-400',
      3: 'text-blue-600 dark:text-blue-400',
      5: 'text-orange-600 dark:text-orange-400',
      6: 'text-purple-600 dark:text-purple-400',
    }
    return colors[status] || 'text-gray-600 dark:text-gray-400'
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleSkipTask}
          className="gap-2 border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          title="Skip this task (Ctrl/Cmd + S)"
        >
          <SkipForward className="h-4 w-4" />
          <span className="hidden sm:inline">Skip Task</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              <span className="hidden sm:inline">Modify Task</span>
              <span className="sm:hidden">Modify</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-zinc-200 dark:border-zinc-800">
            <DropdownMenuItem onClick={handleMarkAsFixed} className={`gap-2 ${getStatusColor(1)}`}>
              <CheckCircle2 className="h-4 w-4" />
              <span>Mark as Fixed</span>
              <span className="ml-auto text-xs text-zinc-500">Ctrl+F</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleMarkAsFalsePositive}
              className={`gap-2 ${getStatusColor(2)}`}
            >
              <Flag className="h-4 w-4" />
              <span>Mark as False Positive</span>
              <span className="ml-auto text-xs text-zinc-500">Ctrl+P</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleMarkAsAlreadyFixed}
              className={`gap-2 ${getStatusColor(6)}`}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Mark as Already Fixed</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleMarkAsTooHard}
              className={`gap-2 ${getStatusColor(5)}`}
            >
              <X className="h-4 w-4" />
              <span>Mark as Too Hard</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="gap-2 text-xs text-zinc-500">
              More options coming soon
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <EditorButton task={task} />
      </div>

      {/* Task Action Modal */}
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
