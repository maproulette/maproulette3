import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { MapRef } from 'react-map-gl/maplibre'
import { ArrowLeft, MapPin, Package, Play, Trash2, X, ZoomIn } from 'lucide-react'
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
    <div className="flex h-[350px] w-[250px] flex-col overflow-hidden rounded-lg bg-white/90 shadow-lg backdrop-blur-sm dark:bg-zinc-900/90">
      <div className="flex-shrink-0 border-zinc-200 border-b bg-white/90 px-2 pt-2 pb-1.5 dark:border-zinc-800 dark:bg-zinc-900/90">
        <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
          Overlapping Tasks ({tasks.length})
        </h3>
      </div>
      <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 py-2">
        {isLoading ? (
          <div className="py-4 text-center text-xs text-zinc-500">Loading tasks...</div>
        ) : (
          tasks.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => handleTaskSelect(task.id)}
              className="w-full rounded bg-zinc-100 p-1.5 text-left transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
            >
              <div className="font-medium text-xs text-zinc-900 dark:text-zinc-100">
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
      <div className="flex-shrink-0 border-zinc-200 border-b px-2 dark:border-zinc-800">
        <TabsList className="h-auto gap-0 bg-transparent p-0">
          <TabsTrigger
            value="info"
            className="rounded-none border-transparent border-b-2 px-2 py-1 font-medium text-xs text-zinc-900 data-[state=active]:border-white data-[state=active]:bg-black data-[state=active]:text-white data-[state=inactive]:text-zinc-600 dark:text-zinc-100 dark:data-[state=active]:bg-zinc-900 dark:data-[state=active]:text-zinc-100 dark:data-[state=inactive]:text-zinc-400"
          >
            Task Info
          </TabsTrigger>
          <TabsTrigger
            value="properties"
            className="rounded-none border-transparent border-b-2 px-2 py-1 font-medium text-xs text-zinc-900 data-[state=active]:border-white data-[state=active]:bg-black data-[state=active]:text-white data-[state=inactive]:text-zinc-600 dark:text-zinc-100 dark:data-[state=active]:bg-zinc-900 dark:data-[state=active]:text-zinc-100 dark:data-[state=inactive]:text-zinc-400"
          >
            Properties
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Task Info Tab */}
      <TabsContent value="info" className="m-0 min-h-0 flex-1 space-y-1 overflow-y-auto px-2 py-2">
        {isLoading ? (
          <div className="py-4 text-center text-xs text-zinc-500">Loading task details...</div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Name:</span>
              <span className="text-right text-xs text-zinc-900 dark:text-zinc-100 truncate ml-1">
                {task.name || task.id.toString()}
              </span>
            </div>
            {locationString && (
              <div className="flex items-start justify-between">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Location:</span>
                <span className="text-right text-xs text-zinc-900 dark:text-zinc-100">
                  {locationString}
                </span>
              </div>
            )}
            <div className="flex items-start justify-between">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Task ID:</span>
              <span className="text-right text-xs text-zinc-900 dark:text-zinc-100">{task.id}</span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Challenge ID:</span>
              <span className="text-right text-xs text-zinc-900 dark:text-zinc-100">
                {task.parent}
              </span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Project ID:</span>
              <span className="text-right text-xs text-zinc-900 dark:text-zinc-100">
                {/* Project ID would need to be fetched separately or included in task response */}-
              </span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Priority:</span>
              <span className="text-right text-xs text-zinc-900 dark:text-zinc-100">
                {task.priority}
              </span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Geometry Type:</span>
              <span className="text-right text-xs text-zinc-900 dark:text-zinc-100">
                {geometryType}
              </span>
            </div>
          </>
        )}
      </TabsContent>

      {/* Properties Tab */}
      <TabsContent value="properties" className="m-0 min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {isLoading ? (
          <div className="py-4 text-center text-xs text-zinc-500">Loading properties...</div>
        ) : properties && Object.keys(properties).length > 0 ? (
          <div className="space-y-1">
            <h3 className="mb-2 font-medium text-[10px] text-zinc-400 uppercase tracking-wide dark:text-zinc-500">
              Feature Properties
            </h3>
            <div className="space-y-1">
              {Object.entries(properties)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, value]) => (
                  <div key={key} className="flex items-start justify-between text-xs">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{key}:</span>
                    <span className="ml-2 text-right text-zinc-600 dark:text-zinc-400 truncate">
                      {String(value)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-zinc-500">No feature properties available</div>
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
    <div className="flex h-[350px] w-[250px] flex-col overflow-hidden rounded-lg bg-white/90 shadow-lg backdrop-blur-sm dark:bg-zinc-900/90">
      {/* Header */}
      <div className="relative flex-shrink-0 border-zinc-200 border-b bg-white/90 px-2 pt-2 pb-1.5 dark:border-zinc-800 dark:bg-zinc-900/90">
        <button
          type="button"
          onClick={onBack}
          className="absolute top-2 left-2 text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
          aria-label="Back"
        >
          <ArrowLeft className="h-3 w-3" />
        </button>

        <div className="flex items-start gap-2 pr-6 pl-6">
          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-purple-600">
            <MapPin className="h-3 w-3 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Task #{task.id}</h2>
            <div className="mt-0.5 flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-purple-600"></div>
              <span className="text-purple-600 text-xs dark:text-purple-400">{statusLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <TaskDetailTabs task={task} />

      {/* Bundle Buttons */}
      {showBundleButtons && (
        <div className="flex-shrink-0 border-zinc-200 border-t px-2 pt-1.5 pb-1.5 dark:border-zinc-800">
          {canBundleTask ? (
            <Button
              onClick={() => onAddToBundle?.(task.id)}
              variant="outline"
              size="sm"
              className="w-full border-green-500 text-green-600 hover:bg-green-50 text-xs py-1 h-auto dark:border-green-600 dark:text-green-400 dark:hover:bg-green-950"
            >
              <Package className="h-3 w-3" />
              Bundle this task
            </Button>
          ) : canRemoveFromBundle ? (
            <Button
              onClick={() => onRemoveFromBundle?.(task.id)}
              variant="outline"
              size="sm"
              className="w-full border-red-500 text-red-600 hover:bg-red-50 text-xs py-1 h-auto dark:border-red-600 dark:text-red-400 dark:hover:bg-red-950"
            >
              <Trash2 className="h-3 w-3" />
              Remove from Bundle
            </Button>
          ) : isInBundle && isPrimaryTask ? (
            <div className="flex items-center justify-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
              <Package className="h-3 w-3" />
              Primary task in bundle
            </div>
          ) : isInBundle ? (
            <div className="flex items-center justify-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
              <Package className="h-3 w-3" />
              In bundle
            </div>
          ) : null}
        </div>
      )}

      {/* Start Task Button */}
      {showStartButton && (
        <div className="flex-shrink-0 border-zinc-200 border-t px-2 pt-2 pb-2 dark:border-zinc-800">
          <Button
            onClick={handleStartTask}
            variant="outline"
            className="w-full border-zinc-300 bg-white hover:bg-zinc-50 text-xs py-1 h-auto dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            disabled={!task}
          >
            <Play className="h-3 w-3" />
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
  mapRef?: React.RefObject<MapRef | null>
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
  mapRef,
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

  const handleZoomToTask = () => {
    if (!mapRef?.current || !taskMarker.location) return

    const map = mapRef.current.getMap()
    if (!map) return

    const lng = taskMarker.location.lng
    const lat = taskMarker.location.lat

    mapRef.current.flyTo({
      center: [lng, lat],
      zoom: 16,
      duration: 1000,
    })
  }

  const status = task?.status ?? 0
  const statusLabel = STATUS_LABELS[status] || 'Created'

  const isInBundle = activeBundle?.taskIds.includes(taskMarker.id) ?? false
  const isPrimaryTask = primaryTaskId === taskMarker.id
  const canBundleTask = showBundleButtons && !isInBundle && !isPrimaryTask && !bundleEditsDisabled
  const canRemoveFromBundle =
    showBundleButtons && activeBundle && isInBundle && !isPrimaryTask && !bundleEditsDisabled

  return (
    <div className="flex h-[350px] w-[250px] flex-col overflow-hidden rounded-lg bg-white/90 shadow-lg backdrop-blur-sm dark:bg-zinc-900/90">
      {/* Header */}
      <div className="relative flex-shrink-0 border-zinc-200 border-b bg-white/90 px-2 pt-2 pb-1.5 dark:border-zinc-800 dark:bg-zinc-900/90">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
          aria-label="Close"
        >
          <X className="h-3 w-3" />
        </button>

        <div className="flex items-start gap-2 pr-6">
          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-purple-600">
            <MapPin className="h-3 w-3 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Task #{task?.id ?? taskMarker.id}
            </h2>
            <div className="mt-0.5 flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-purple-600"></div>
              <span className="text-purple-600 text-xs dark:text-purple-400">{statusLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <TaskDetailTabs task={task ?? null} isLoading={isLoading} />

      {/* Bundle Buttons */}
      {showBundleButtons && (
        <div className="flex-shrink-0 border-zinc-200 border-t px-2 pt-1.5 pb-1.5 dark:border-zinc-800">
          {canBundleTask ? (
            <Button
              onClick={() => onAddToBundle?.(taskMarker.id)}
              variant="outline"
              size="sm"
              className="w-full border-green-500 text-green-600 hover:bg-green-50 text-xs py-1 h-auto dark:border-green-600 dark:text-green-400 dark:hover:bg-green-950"
            >
              <Package className="h-3 w-3" />
              Bundle this task
            </Button>
          ) : canRemoveFromBundle ? (
            <Button
              onClick={() => onRemoveFromBundle?.(taskMarker.id)}
              variant="outline"
              size="sm"
              className="w-full border-red-500 text-red-600 hover:bg-red-50 text-xs py-1 h-auto dark:border-red-600 dark:text-red-400 dark:hover:bg-red-950"
            >
              <Trash2 className="h-3 w-3" />
              Remove from Bundle
            </Button>
          ) : isInBundle && isPrimaryTask ? (
            <div className="flex items-center justify-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
              <Package className="h-3 w-3" />
              Primary task in bundle
            </div>
          ) : isInBundle ? (
            <div className="flex items-center justify-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
              <Package className="h-3 w-3" />
              In bundle
            </div>
          ) : null}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex-shrink-0 border-zinc-200 border-t px-2 pt-2 pb-2 dark:border-zinc-800 space-y-1">
        {mapRef && taskMarker.location && (
          <Button
            onClick={handleZoomToTask}
            variant="outline"
            className="w-full border-purple-500 text-purple-600 hover:bg-purple-50 text-xs py-1 h-auto dark:border-purple-600 dark:text-purple-400 dark:hover:bg-purple-950"
          >
            <ZoomIn className="h-3 w-3" />
            Zoom to Task
          </Button>
        )}
        {showStartButton && (
          <Button
            onClick={handleStartTask}
            variant="outline"
            className="w-full border-zinc-300 bg-white hover:bg-zinc-50 text-xs py-1 h-auto dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            disabled={isLoading || !task}
          >
            <Play className="h-3 w-3" />
            Start Task
          </Button>
        )}
      </div>
    </div>
  )
}
