import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Layers, Loader2, MapPin, Play, X } from 'lucide-react'
import { api } from '@/api'
import { STATUS_CONFIG } from '@/components/shared/TaskMarkers/const'
import { router } from '@/main'
import type { TaskMarker } from '@/types/Task'

type StatusKey = keyof typeof STATUS_CONFIG

const isValidStatus = (status: number): status is StatusKey => {
  return status in STATUS_CONFIG
}

const getStatusConfig = (status: number) => {
  return isValidStatus(status) ? STATUS_CONFIG[status] : STATUS_CONFIG[0]
}

interface OverlapPopupProps {
  tasks: TaskMarker[]
  onClose?: () => void
}

export const OverlapPopup = ({ tasks, onClose }: OverlapPopupProps) => {
  const taskCount = tasks.length
  const displayTasks = tasks.slice(0, 8)
  const remainingCount = taskCount - 8

  const navigateToTask = (taskId: string) => {
    router.navigate({ to: '/tasks/$taskId', params: { taskId } })
  }

  return (
    <div className="w-[280px] font-sans">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-2 border-zinc-200 border-b pb-2.5 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-900">
            <Layers className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-zinc-800">{taskCount} Overlapping Tasks</h3>
            <p className="text-[11px] text-zinc-500">Click a task to view details</p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            aria-label="Close popup"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Task List */}
      <div className="mb-3 max-h-[220px] space-y-1.5 overflow-y-auto pr-1">
        {displayTasks.map((task) => {
          const statusConfig = getStatusConfig(task.status)
          return (
            <button
              key={task.id}
              type="button"
              onClick={() => navigateToTask(task.id.toString())}
              className="group flex w-full cursor-pointer items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50/50 p-2 text-left transition-all hover:border-zinc-200 hover:bg-zinc-100"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-md text-white shadow-sm"
                  style={{ backgroundColor: statusConfig.color }}
                >
                  <MapPin className="h-3 w-3" />
                </div>
                <div>
                  <div className="font-medium text-[13px] text-zinc-800">Task #{task.id}</div>
                  <div className="flex items-center gap-1">
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: statusConfig.color }}
                    />
                    <span className="text-[10px] text-zinc-500">{statusConfig.label}</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-300 transition-colors group-hover:text-zinc-500" />
            </button>
          )
        })}
        {remainingCount > 0 && (
          <div className="py-1.5 text-center text-[11px] text-zinc-400">
            +{remainingCount} more task{remainingCount === 1 ? '' : 's'} at this location
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={() => navigateToTask(tasks[0]?.id.toString() || '')}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-zinc-900 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
      >
        <Play className="h-4 w-4" />
        Start First Task
      </button>
    </div>
  )
}

interface SingleTaskPopupProps {
  taskId?: number
  task?: TaskMarker
  onClose?: () => void
}

export const SingleTaskPopup = ({ taskId, task: initialTask, onClose }: SingleTaskPopupProps) => {
  // If taskId is provided, fetch full task data. Otherwise use the provided task marker.
  const effectiveTaskId = taskId ?? initialTask?.id
  
  // Only fetch if we have a valid taskId (not from initialTask fallback, as that won't have full data)
  const shouldFetch = !!taskId && typeof taskId === 'number' && taskId > 0
  
  const taskQueryOptions = taskId && taskId > 0 ? api.task.getTask(taskId) : {
    queryKey: ['task', 'disabled'],
    queryFn: async () => null,
    enabled: false,
  }
  
  const { data: fetchedTask, isLoading, error } = useQuery({
    ...taskQueryOptions,
    enabled: shouldFetch,
  })

  // Use fetched task if available, otherwise use initial task marker (for backward compatibility)
  const task = fetchedTask ?? (initialTask ? {
    id: initialTask.id,
    status: initialTask.status,
    priority: initialTask.priority,
    parent: undefined,
    bundleId: undefined,
    changesetId: undefined,
    name: undefined,
    instruction: undefined,
  } : null)

  const { data: challenge } = useQuery({
    ...api.challenge.getChallenge(task?.parent ?? 0),
    enabled: !!task?.parent,
  })

  const { data: project } = useQuery({
    ...api.project.getProject(challenge?.parent),
    enabled: !!challenge?.parent,
  })

  if (isLoading) {
    return (
      <div className="w-[280px] font-sans">
        <div className="flex items-center justify-center gap-2 py-8">
          <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
          <span className="text-sm text-zinc-500">Loading task data...</span>
        </div>
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="w-[280px] font-sans">
        <div className="py-4 text-center">
          <p className="text-sm text-red-600">Failed to load task data</p>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="mt-2 text-xs text-zinc-500 hover:text-zinc-700"
            >
              Close
            </button>
          )}
        </div>
      </div>
    )
  }

  const statusInfo = getStatusConfig(task.status ?? 0)

  const navigateToTask = () => {
    router.navigate({ to: '/tasks/$taskId', params: { taskId: task.id.toString() } })
  }

  return (
    <div className="w-[280px] font-sans">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-2.5 border-zinc-100 border-b pb-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg shadow-sm"
            style={{ backgroundColor: statusInfo.color }}
          >
            <MapPin className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[15px] text-zinc-800">Task #{task.id}</h3>
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: statusInfo.color }}
              />
              <span className="font-medium text-xs" style={{ color: statusInfo.color }}>
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            aria-label="Close popup"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Task Properties */}
      <div className="mb-3 space-y-2 border-zinc-100 border-b pb-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-zinc-500">Task ID:</span>
          <span className="font-medium text-zinc-800">{task.id}</span>
        </div>
        {task.parent && (
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Challenge ID:</span>
            <span className="font-medium text-zinc-800">{task.parent}</span>
          </div>
        )}
        {challenge?.parent && (
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Project ID:</span>
            <span className="font-medium text-zinc-800">{challenge.parent}</span>
          </div>
        )}
        {task.priority !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Priority:</span>
            <span className="font-medium text-zinc-800">{task.priority}</span>
          </div>
        )}
        {task.bundleId && (
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Bundle ID:</span>
            <span className="font-medium text-zinc-800">{task.bundleId}</span>
          </div>
        )}
        {task.changesetId && (
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Changeset ID:</span>
            <span className="font-medium text-zinc-800">{task.changesetId}</span>
          </div>
        )}
        {task.name && (
          <div className="flex flex-col gap-1">
            <span className="text-zinc-500">Name:</span>
            <span className="font-medium text-zinc-800">{task.name}</span>
          </div>
        )}
        {task.instruction && (
          <div className="flex flex-col gap-1">
            <span className="text-zinc-500">Instruction:</span>
            <span className="font-medium text-zinc-800 line-clamp-2">{task.instruction}</span>
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={navigateToTask}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-zinc-900 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
      >
        <Play className="h-4 w-4" />
        Start Task
      </button>
    </div>
  )
}
