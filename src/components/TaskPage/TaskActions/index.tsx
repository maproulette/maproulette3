import { ArrowRight, CheckCircle2, ChevronDown, Flag, SkipForward, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { useTaskContext } from '@/contexts/tasks/TaskContext'
import { TaskActionModal } from '../TaskActionModal'

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

  const handleMarkAsTooHard = () => {
    openModal(5, 'Too Hard')
  }

  const handleMarkAsAlreadyFixed = () => {
    openModal(6, 'Already Fixed')
  }

  const handleOpenInID = () => {
    if (!task.location) {
      toast.error('Task location not available')
      return
    }

    try {
      // Parse location to get coordinates
      const location = typeof task.location === 'string' ? JSON.parse(task.location) : task.location
      const [lng, lat] = location.coordinates || [0, 0]

      // Build iD editor URL with task location
      // Format: https://www.openstreetmap.org/edit?editor=id#map=zoom/lat/lng
      const zoom = 18
      const idEditorUrl = `https://www.openstreetmap.org/edit?editor=id#map=${zoom}/${lat}/${lng}`

      // Open in new tab
      window.open(idEditorUrl, '_blank', 'noopener,noreferrer')
      toast.success('Opening task in iD editor')
    } catch (error) {
      console.error('Error opening iD editor:', error)
      toast.error('Failed to open iD editor')
    }
  }

  return (
    <>
      <div className="flex items-center space-x-3">
        <Button variant="secondary" size="sm" onClick={handleSkipTask} className="gap-2">
          <SkipForward className="h-4 w-4" />
          Skip Task
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="sm" className="gap-2">
              <span>Modify Task</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleMarkAsFixed} className="gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Mark as Fixed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleMarkAsFalsePositive} className="gap-2">
              <Flag className="h-4 w-4 text-yellow-600" />
              Mark as False Positive
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleMarkAsAlreadyFixed} className="gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              Mark as Already Fixed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleMarkAsTooHard} className="gap-2">
              <X className="h-4 w-4 text-orange-600" />
              Mark as Too Hard
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="gap-2 text-xs text-zinc-500">
              More options coming soon
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button size="sm" onClick={handleOpenInID} className="gap-2">
          <span>Edit in iD (web editor)</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
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
