import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, MapPin, Package, Play, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { api } from '@/api'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { getTaskFeatureProperties } from '@/plugins/RapidEditorPlugin/editorUtils'
import type { Task, TaskMarker } from '@/types/Task'

interface OverlapPopupProps {
  tasks: TaskMarker[]
  onTaskSelect?: (taskId: number | null) => void
  showStartButton?: boolean
  showBundleButtons?: boolean
  activeBundle?: { bundleId: number; taskIds: number[] } | null
  primaryTaskId?: number
  onAddToBundle?: (taskId: number) => void
  onRemoveFromBundle?: (taskId: number) => void
  bundleEditsDisabled?: boolean
}

export const OverlapPopup = ({
  tasks,
  onTaskSelect,
  showStartButton = true,
  showBundleButtons = false,
  activeBundle,
  primaryTaskId,
  onAddToBundle,
  onRemoveFromBundle,
  bundleEditsDisabled = false,
}: OverlapPopupProps) => {
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  const { data: tasksData, isLoading } = useQuery(api.task.getTasks(tasks.map((task) => task.id)))

  const handleTaskSelect = (taskId: number) => {
    setSelectedTaskId(taskId)
    onTaskSelect?.(taskId)
  }

  const handleBack = () => {
    setSelectedTaskId(null)
    onTaskSelect?.(null)
  }

  // If a task is selected and data is loaded, show the detail view
  if (selectedTaskId && tasksData) {
    const selectedTask = tasksData.find((task) => task.id === selectedTaskId)
    if (selectedTask) {
      return (
        <OverlapTaskDetail
          task={selectedTask}
          onBack={handleBack}
          showStartButton={showStartButton}
          showBundleButtons={showBundleButtons}
          activeBundle={activeBundle}
          primaryTaskId={primaryTaskId}
          onAddToBundle={onAddToBundle}
          onRemoveFromBundle={onRemoveFromBundle}
          bundleEditsDisabled={bundleEditsDisabled}
        />
      )
    }
  }

  return (
    <div className="flex h-[500px] w-full max-w-[400px] flex-col overflow-hidden rounded-lg bg-white shadow-lg dark:bg-zinc-900">
      <div className="flex-shrink-0 border-zinc-200 border-b bg-white px-4 pt-4 pb-3 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
          Overlapping Tasks ({tasks.length})
        </h3>
      </div>
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="py-8 text-center text-zinc-500">Loading tasks...</div>
        ) : (
          tasks.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => handleTaskSelect(task.id)}
              className="w-full rounded bg-zinc-100 p-3 text-left transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
            >
              <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                Task #{task.id}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

const STATUS_LABELS: Record<number, string> = {
  0: 'Created',
  1: 'Fixed',
  2: 'False Positive',
  3: 'Skipped',
  4: 'Deleted',
  5: 'Too Hard',
  6: 'Already Fixed',
  7: 'Answered',
  8: 'Validated',
  9: 'Disabled',
}

const getGeometryType = (task: Task): string => {
  if (!task.geometries) return 'Unknown'

  try {
    const geometries =
      typeof task.geometries === 'string' ? JSON.parse(task.geometries) : task.geometries

    if (geometries.features && geometries.features.length > 0) {
      const firstFeature = geometries.features[0]
      if (firstFeature.geometry?.type) {
        return firstFeature.geometry.type
      }
    }
  } catch (error) {
    console.error('Failed to parse task geometries:', error)
  }

  return 'Unknown'
}

const getLocationString = (task: Task): string | null => {
  if (!task.location) return null

  try {
    const location = typeof task.location === 'string' ? JSON.parse(task.location) : task.location

    if (location.coordinates && Array.isArray(location.coordinates)) {
      const [lng, lat] = location.coordinates
      return `${lat}, ${lng}`
    }
  } catch (error) {
    console.error('Failed to parse task location:', error)
  }

  return null
}

interface OverlapTaskDetailProps {
  task: Task
  onBack: () => void
  showStartButton?: boolean
  showBundleButtons?: boolean
  activeBundle?: { bundleId: number; taskIds: number[] } | null
  primaryTaskId?: number
  onAddToBundle?: (taskId: number) => void
  onRemoveFromBundle?: (taskId: number) => void
  bundleEditsDisabled?: boolean
}

// Shared component for task detail tabs content
interface TaskDetailTabsProps {
  task: Task | null
  isLoading?: boolean
}

const TaskDetailTabs = ({ task, isLoading = false }: TaskDetailTabsProps) => {
  const [activeTab, setActiveTab] = useState<'info' | 'properties'>('info')

  if (!task) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <div className="text-center text-zinc-500">No task selected</div>
      </div>
    )
  }

  const properties = getTaskFeatureProperties(task)
  const geometryType = getGeometryType(task)
  const locationString = getLocationString(task)

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as 'info' | 'properties')}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="flex-shrink-0 border-zinc-200 border-b px-4 dark:border-zinc-800">
        <TabsList className="h-auto gap-0 bg-transparent p-0">
          <TabsTrigger
            value="info"
            className="rounded-none border-transparent border-b-2 px-4 py-2 font-medium text-sm text-zinc-900 data-[state=active]:border-white data-[state=active]:bg-black data-[state=active]:text-white data-[state=inactive]:text-zinc-600 dark:text-zinc-100 dark:data-[state=active]:bg-zinc-900 dark:data-[state=active]:text-zinc-100 dark:data-[state=inactive]:text-zinc-400"
          >
            Task Info
          </TabsTrigger>
          <TabsTrigger
            value="properties"
            className="rounded-none border-transparent border-b-2 px-4 py-2 font-medium text-sm text-zinc-900 data-[state=active]:border-white data-[state=active]:bg-black data-[state=active]:text-white data-[state=inactive]:text-zinc-600 dark:text-zinc-100 dark:data-[state=active]:bg-zinc-900 dark:data-[state=active]:text-zinc-100 dark:data-[state=inactive]:text-zinc-400"
          >
            Properties
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Task Info Tab */}
      <TabsContent value="info" className="m-0 min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="py-8 text-center text-zinc-500">Loading task details...</div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Name:</span>
              <span className="text-right text-sm text-zinc-900 dark:text-zinc-100">
                {task.name || task.id.toString()}
              </span>
            </div>
            {locationString && (
              <div className="flex items-start justify-between">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">Location:</span>
                <span className="text-right text-sm text-zinc-900 dark:text-zinc-100">
                  {locationString}
                </span>
              </div>
            )}
            <div className="flex items-start justify-between">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Task ID:</span>
              <span className="text-right text-sm text-zinc-900 dark:text-zinc-100">{task.id}</span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Challenge ID:</span>
              <span className="text-right text-sm text-zinc-900 dark:text-zinc-100">
                {task.parent}
              </span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Project ID:</span>
              <span className="text-right text-sm text-zinc-900 dark:text-zinc-100">
                {/* Project ID would need to be fetched separately or included in task response */}-
              </span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Priority:</span>
              <span className="text-right text-sm text-zinc-900 dark:text-zinc-100">
                {task.priority}
              </span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Geometry Type:</span>
              <span className="text-right text-sm text-zinc-900 dark:text-zinc-100">
                {geometryType}
              </span>
            </div>
          </>
        )}
      </TabsContent>

      {/* Properties Tab */}
      <TabsContent value="properties" className="m-0 min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="py-8 text-center text-zinc-500">Loading properties...</div>
        ) : properties && Object.keys(properties).length > 0 ? (
          <div className="space-y-2">
            <h3 className="mb-3 font-medium text-xs text-zinc-400 uppercase tracking-wide dark:text-zinc-500">
              Feature Properties
            </h3>
            <div className="space-y-2">
              {Object.entries(properties)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, value]) => (
                  <div key={key} className="flex items-start justify-between text-sm">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{key}:</span>
                    <span className="ml-4 text-right text-zinc-600 dark:text-zinc-400">
                      {String(value)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-zinc-500">No feature properties available</div>
        )}
      </TabsContent>
    </Tabs>
  )
}

const OverlapTaskDetail = ({
  task,
  onBack,
  showStartButton = true,
  showBundleButtons = false,
  activeBundle,
  primaryTaskId,
  onAddToBundle,
  onRemoveFromBundle,
  bundleEditsDisabled = false,
}: OverlapTaskDetailProps) => {
  const navigate = useNavigate()

  const handleStartTask = () => {
    if (task) {
      navigate({
        to: '/tasks/$taskId',
        params: { taskId: task.id.toString() },
      })
    }
  }

  const status = task.status ?? 0
  const statusLabel = STATUS_LABELS[status] || 'Created'

  const isInBundle = activeBundle?.taskIds.includes(task.id) ?? false
  const isPrimaryTask = primaryTaskId === task.id
  const canBundleTask = showBundleButtons && !isInBundle && !isPrimaryTask && !bundleEditsDisabled
  const canRemoveFromBundle =
    showBundleButtons && activeBundle && isInBundle && !isPrimaryTask && !bundleEditsDisabled

  return (
    <div className="flex h-[500px] w-full max-w-[400px] flex-col overflow-hidden rounded-lg bg-white shadow-lg dark:bg-zinc-900">
      {/* Header */}
      <div className="relative flex-shrink-0 border-zinc-200 border-b bg-white px-4 pt-4 pb-3 dark:border-zinc-800 dark:bg-zinc-900">
        <button
          type="button"
          onClick={onBack}
          className="absolute top-4 left-4 text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-3 pr-8 pl-8">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-600">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-xl text-zinc-900 dark:text-zinc-100">Task #{task.id}</h2>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-600"></div>
              <span className="text-purple-600 text-sm dark:text-purple-400">{statusLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <TaskDetailTabs task={task} />

      {/* Bundle Buttons */}
      {showBundleButtons && (
        <div className="flex-shrink-0 border-zinc-200 border-t px-4 pt-3 pb-3 dark:border-zinc-800">
          {canBundleTask ? (
            <Button
              onClick={() => onAddToBundle?.(task.id)}
              variant="outline"
              size="sm"
              className="w-full border-green-500 text-green-600 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-950"
            >
              <Package className="h-4 w-4" />
              Bundle this task
            </Button>
          ) : canRemoveFromBundle ? (
            <Button
              onClick={() => onRemoveFromBundle?.(task.id)}
              variant="outline"
              size="sm"
              className="w-full border-red-500 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-950"
            >
              <Trash2 className="h-4 w-4" />
              Remove from Bundle
            </Button>
          ) : isInBundle && isPrimaryTask ? (
            <div className="flex items-center justify-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Package className="h-4 w-4" />
              Primary task in bundle
            </div>
          ) : isInBundle ? (
            <div className="flex items-center justify-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Package className="h-4 w-4" />
              In bundle
            </div>
          ) : null}
        </div>
      )}

      {/* Start Task Button */}
      {showStartButton && (
        <div className="flex-shrink-0 border-zinc-200 border-t px-4 pt-4 pb-4 dark:border-zinc-800">
          <Button
            onClick={handleStartTask}
            variant="outline"
            className="w-full border-zinc-300 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            disabled={!task}
          >
            <Play className="h-4 w-4" />
            Start Task
          </Button>
        </div>
      )}
    </div>
  )
}

interface SingleTaskPopupProps {
  task: TaskMarker
  onClose: () => void
  showStartButton?: boolean
  showBundleButtons?: boolean
  activeBundle?: { bundleId: number; taskIds: number[] } | null
  primaryTaskId?: number
  onAddToBundle?: (taskId: number) => void
  onRemoveFromBundle?: (taskId: number) => void
  bundleEditsDisabled?: boolean
}

export const SingleTaskPopup = ({
  task: taskMarker,
  onClose,
  showStartButton = true,
  showBundleButtons = false,
  activeBundle,
  primaryTaskId,
  onAddToBundle,
  onRemoveFromBundle,
  bundleEditsDisabled = false,
}: SingleTaskPopupProps) => {
  const { data: task, isLoading } = useQuery(api.task.getTask(taskMarker.id))
  const navigate = useNavigate()

  const handleStartTask = () => {
    if (task) {
      navigate({
        to: '/tasks/$taskId',
        params: { taskId: task.id.toString() },
      })
    }
  }

  const status = task?.status ?? 0
  const statusLabel = STATUS_LABELS[status] || 'Created'

  const isInBundle = activeBundle?.taskIds.includes(taskMarker.id) ?? false
  const isPrimaryTask = primaryTaskId === taskMarker.id
  const canBundleTask = showBundleButtons && !isInBundle && !isPrimaryTask && !bundleEditsDisabled
  const canRemoveFromBundle =
    showBundleButtons && activeBundle && isInBundle && !isPrimaryTask && !bundleEditsDisabled

  return (
    <div className="flex h-[500px] w-full max-w-[400px] flex-col overflow-hidden rounded-lg bg-white shadow-lg dark:bg-zinc-900">
      {/* Header */}
      <div className="relative flex-shrink-0 border-zinc-200 border-b bg-white px-4 pt-4 pb-3 dark:border-zinc-800 dark:bg-zinc-900">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-3 pr-8">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-600">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-xl text-zinc-900 dark:text-zinc-100">
              Task #{task?.id ?? taskMarker.id}
            </h2>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-600"></div>
              <span className="text-purple-600 text-sm dark:text-purple-400">{statusLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <TaskDetailTabs task={task ?? null} isLoading={isLoading} />

      {/* Bundle Buttons */}
      {showBundleButtons && (
        <div className="flex-shrink-0 border-zinc-200 border-t px-4 pt-3 pb-3 dark:border-zinc-800">
          {canBundleTask ? (
            <Button
              onClick={() => onAddToBundle?.(taskMarker.id)}
              variant="outline"
              size="sm"
              className="w-full border-green-500 text-green-600 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-950"
            >
              <Package className="h-4 w-4" />
              Bundle this task
            </Button>
          ) : canRemoveFromBundle ? (
            <Button
              onClick={() => onRemoveFromBundle?.(taskMarker.id)}
              variant="outline"
              size="sm"
              className="w-full border-red-500 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-950"
            >
              <Trash2 className="h-4 w-4" />
              Remove from Bundle
            </Button>
          ) : isInBundle && isPrimaryTask ? (
            <div className="flex items-center justify-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Package className="h-4 w-4" />
              Primary task in bundle
            </div>
          ) : isInBundle ? (
            <div className="flex items-center justify-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Package className="h-4 w-4" />
              In bundle
            </div>
          ) : null}
        </div>
      )}

      {/* Start Task Button */}
      {showStartButton && (
        <div className="flex-shrink-0 border-zinc-200 border-t px-4 pt-4 pb-4 dark:border-zinc-800">
          <Button
            onClick={handleStartTask}
            variant="outline"
            className="w-full border-zinc-300 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            disabled={isLoading || !task}
          >
            <Play className="h-4 w-4" />
            Start Task
          </Button>
        </div>
      )}
    </div>
  )
}
