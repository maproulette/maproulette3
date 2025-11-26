import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, MapPin, Shuffle } from 'lucide-react'
import { useId, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import type { Task } from '@/types/Task'
import { TaskNearbyMap } from './TaskNearbyMap'

interface TaskActionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task
  initialStatus: number
}

const STATUS_OPTIONS = [
  { value: 1, label: 'Fixed' },
  { value: 2, label: 'False Positive' },
  { value: 3, label: 'Skipped' },
  { value: 5, label: 'Too Hard' },
  { value: 6, label: 'Already Fixed' },
]

const STATUS_LABELS: Record<number, string> = {
  0: 'Created',
  1: 'Fixed',
  2: 'False Positive',
  3: 'Skipped',
  4: 'Deleted',
  5: 'Too Hard',
  6: 'Already Fixed',
}

export const TaskActionModal = ({
  open,
  onOpenChange,
  task,
  initialStatus,
}: TaskActionModalProps) => {
  const navigate = useNavigate()
  const commentId = useId()
  const tagsId = useId()
  const randomId = useId()
  const nearbyId = useId()
  const [newStatus, setNewStatus] = useState(initialStatus)
  const [comment, setComment] = useState('')
  const [tags, setTags] = useState('')
  const [nextTaskType, setNextTaskType] = useState<'nearby' | 'random'>('random')
  const [selectedNearbyTaskId, setSelectedNearbyTaskId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentStatus = task.status ?? 0
  const currentStatusLabel = STATUS_LABELS[currentStatus] || 'Unknown'

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      const tagArray = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const updateData = {
        status: newStatus,
        comment: comment || undefined,
        tags: tagArray.length > 0 ? tagArray : undefined,
      }

      console.log('Updating task with:', updateData)

      await new Promise((resolve) => setTimeout(resolve, 500))

      toast.success(`Task marked as ${STATUS_LABELS[newStatus]}`)

      if (nextTaskType === 'nearby') {
        if (selectedNearbyTaskId) {
          await navigate({ to: '/tasks/$taskId', params: { taskId: String(selectedNearbyTaskId) } })
        } else {
          toast.info('Loading nearest task...')

          await navigate({
            to: '/challenges/$challengeId',
            params: { challengeId: String(task.parent) },
          })
        }
      } else {
        toast.info('Loading next task...')
        await navigate({
          to: '/challenges/$challengeId',
          params: { challengeId: String(task.parent) },
        })
      }

      onOpenChange(false)
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to update task')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setComment('')
    setTags('')
    setNewStatus(initialStatus)
    setNextTaskType('random')
    setSelectedNearbyTaskId(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Task Action</DialogTitle>
          <DialogDescription>
            Update the task status and optionally add a comment or tags
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Transition */}
          <div className="space-y-2">
            <Label>Status Change</Label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-md bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
                <span className="font-medium text-sm">{currentStatusLabel}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-500" />
              <Select
                value={String(newStatus)}
                onValueChange={(value) => setNewStatus(Number(value))}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor={commentId}>Comment (Optional)</Label>
            <Textarea
              id={commentId}
              placeholder="Add any notes or comments about this task..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor={tagsId}>Tags (Optional)</Label>
            <Input
              id={tagsId}
              placeholder="Enter tags separated by commas (e.g., needs-review, complex)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            <p className="text-xs text-zinc-500">Separate multiple tags with commas</p>
          </div>

          {/* Next Task Selection */}
          <div className="space-y-3">
            <Label>Next Task</Label>
            <RadioGroup
              value={nextTaskType}
              onValueChange={(value) => setNextTaskType(value as 'nearby' | 'random')}
            >
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value="random" id={randomId} className="mt-1" />
                  <div className="flex-1">
                    <Label
                      htmlFor={randomId}
                      className="flex cursor-pointer items-center gap-2 font-medium"
                    >
                      <Shuffle className="h-4 w-4" />
                      Random High Priority Task
                    </Label>
                    <p className="mt-1 text-xs text-zinc-500">
                      Load the next highest priority task from this challenge
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <RadioGroupItem value="nearby" id={nearbyId} className="mt-1" />
                  <div className="flex-1">
                    <Label
                      htmlFor={nearbyId}
                      className="flex cursor-pointer items-center gap-2 font-medium"
                    >
                      <MapPin className="h-4 w-4" />
                      Nearby Task
                    </Label>
                    <p className="mt-1 text-xs text-zinc-500">
                      Select a task near the current one, or auto-select the nearest
                    </p>
                  </div>
                </div>
              </div>
            </RadioGroup>

            {/* Nearby Map */}
            {nextTaskType === 'nearby' && (
              <div className="mt-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                <TaskNearbyMap
                  currentTask={task}
                  selectedTaskId={selectedNearbyTaskId}
                  onTaskSelect={setSelectedNearbyTaskId}
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Complete & Continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
