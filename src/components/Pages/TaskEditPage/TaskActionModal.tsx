import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, MapPin, Shuffle } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/api'
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
import { usePluginContext } from '@/contexts/PluginContext'
import { logger } from '@/lib/logger'
import { STATUS_LABELS } from '@/lib/taskConstants'
import type { TaskActionExtension } from '@/types/Plugin'
import type { Task } from '@/types/Task'
import { PENDING_BUNDLE_ID, useTaskBundleContext } from './contexts/TaskBundleContext'
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
  { value: 5, label: 'Already Fixed' },
  { value: 6, label: "Can't Complete" },
]

export const TaskActionModal = ({
  open,
  onOpenChange,
  task,
  initialStatus,
}: TaskActionModalProps) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { getTaskActionExtensions } = usePluginContext()
  const commentId = useId()
  const tagsId = useId()
  const randomId = useId()
  const nearbyId = useId()
  const [newStatus, setNewStatus] = useState(initialStatus)
  const [comment, setComment] = useState('')
  const [tags, setTags] = useState('')
  const [nextTaskType, setNextTaskType] = useState<'nearby' | 'random'>('random')
  const [selectedNearbyTaskId, setSelectedNearbyTaskId] = useState<number | null>(null)
  const [formState, setFormState] = useState<Record<string, unknown>>({})
  const [extensions, setExtensions] = useState<TaskActionExtension[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const addTaskCommentMutation = api.task.useAddTaskComment()
  const updateTaskStatusMutation = api.task.useUpdateTaskStatus()
  const updateBundleStatusMutation = api.taskBundle.useUpdateTaskBundleStatus()
  const createBundleMutation = api.taskBundle.useCreateTaskBundle()
  const updateBundleMutation = api.taskBundle.useUpdateTaskBundle()
  const { activeBundle, initialBundle } = useTaskBundleContext()
  const currentStatus = task.status ?? 0
  const currentStatusLabel = STATUS_LABELS[currentStatus] || 'Unknown'
  useEffect(() => {
    setNewStatus(initialStatus)
  }, [initialStatus])

  useEffect(() => {
    let cancelled = false
    const loadExtensions = async () => {
      const results = await getTaskActionExtensions()
      if (!cancelled) {
        setExtensions(results)
      }
    }
    void loadExtensions()
    return () => {
      cancelled = true
    }
  }, [getTaskActionExtensions])

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      const tagList = tags
        ? tags
            .trim()
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean)
        : undefined

      let resolvedBundleId: number | null = null

      if (activeBundle && activeBundle.taskIds.length > 1) {
        if (activeBundle.bundleId === PENDING_BUNDLE_ID) {
          const created = await createBundleMutation.mutateAsync({
            name: activeBundle.name,
            taskIds: activeBundle.taskIds,
            primaryId: task.id,
          })
          resolvedBundleId = created.bundleId
        } else {
          const initialIds = initialBundle?.taskIds ?? []
          const sameTasks =
            initialIds.length === activeBundle.taskIds.length &&
            initialIds.every((id) => activeBundle.taskIds.includes(id))
          if (!sameTasks) {
            await updateBundleMutation.mutateAsync({
              bundleId: activeBundle.bundleId,
              taskIds: activeBundle.taskIds,
            })
          }
          resolvedBundleId = activeBundle.bundleId
        }
      } else if (task.bundleId != null) {
        resolvedBundleId = task.bundleId
      }

      const pluginQueryParams = Object.assign(
        {},
        ...extensions.map(
          (extension) => extension.getStatusQueryParams?.(formState, { newStatus, task }) ?? {}
        )
      )

      if (resolvedBundleId != null) {
        await updateBundleStatusMutation.mutateAsync({
          bundleId: resolvedBundleId,
          primaryId: task.id,
          status: newStatus,
          tags: tagList,
          queryParams: pluginQueryParams,
        })
      } else {
        await updateTaskStatusMutation.mutateAsync({
          taskId: task.id,
          status: newStatus,
          options: {
            tags: tagList,
            queryParams: pluginQueryParams,
          },
        })
      }

      if (comment.trim()) {
        addTaskCommentMutation.mutate({ taskId: task.id, commentText: comment.trim() })
      }

      toast.success(`Task marked as ${STATUS_LABELS[newStatus]}`)

      if (nextTaskType === 'nearby' && selectedNearbyTaskId) {
        await navigate({ to: '/tasks/$taskId', params: { taskId: String(selectedNearbyTaskId) } })
      } else {
        toast.info('Loading next task...')
        try {
          const randomTasks = await api.challenge.getRandomTask(task.parent, queryClient)
          if (randomTasks && randomTasks.length > 0) {
            await navigate({ to: '/tasks/$taskId', params: { taskId: String(randomTasks[0].id) } })
          } else {
            toast.info('No more tasks available in this challenge')
            await navigate({
              to: '/challenge/$challengeId',
              params: { challengeId: String(task.parent) },
            })
          }
        } catch {
          toast.error('Failed to load next task')
          await navigate({
            to: '/challenge/$challengeId',
            params: { challengeId: String(task.parent) },
          })
        }
      }

      onOpenChange(false)
    } catch (error) {
      logger.error('Error updating task', { error: String(error) })
      toast.error('Failed to update task. Please try again.')
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
    setFormState({})
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="max-h-[90vh] overflow-y-auto">
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
              <div className="flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-2 dark:bg-slate-700">
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
              placeholder="Enter tags separated by commas (e.g., highway, complex)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            <p className="text-xs text-zinc-500">Separate multiple tags with commas</p>
          </div>

          {extensions.map((extension) => {
            const ExtensionComponent = extension.component
            return (
              <div
                key={extension.id}
                className="space-y-2 rounded-lg border border-zinc-200 p-3 dark:border-slate-700"
              >
                <ExtensionComponent
                  task={task}
                  newStatus={newStatus}
                  setNewStatus={setNewStatus}
                  formState={formState}
                  setFormState={(patch) => setFormState((prev) => ({ ...prev, ...patch }))}
                />
              </div>
            )
          })}

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
              <div className="mt-3 rounded-lg border border-zinc-200 p-3 dark:border-slate-700">
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
          <Button onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Complete & Continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
