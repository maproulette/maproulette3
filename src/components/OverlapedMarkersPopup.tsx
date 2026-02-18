import { useNavigate } from '@tanstack/react-router'
import {
  Eye,
  EyeOff,
  FolderOpen,
  Hash,
  Layers,
  MapPin,
  Play,
  Target,
  X,
  ZoomIn,
} from 'lucide-react'
import { useState } from 'react'
import type { MapRef } from 'react-map-gl/maplibre'
import { api } from '@/api'
import { STATUS_LABELS } from '@/components/shared/taskConstants'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { getTaskFeatureProperties } from '@/plugins/RapidEditorPlugin/editorUtils'
import type { Task, TaskMarker } from '@/types/Task'

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
      <div className="flex-shrink-0 border-zinc-200/50 border-b bg-zinc-50/50 px-3 dark:border-zinc-800/50 dark:bg-zinc-900/50">
        <TabsList className="h-auto gap-1 bg-transparent p-0">
          <TabsTrigger
            value="info"
            className="rounded-md border-transparent px-3 py-1.5 font-medium text-xs text-zinc-600 transition-all data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm dark:text-zinc-400 dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-purple-400"
          >
            Task Info
          </TabsTrigger>
          <TabsTrigger
            value="properties"
            className="rounded-md border-transparent px-3 py-1.5 font-medium text-xs text-zinc-600 transition-all data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm dark:text-zinc-400 dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-purple-400"
          >
            Properties
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Task Info Tab */}
      <TabsContent value="info" className="m-0 min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-xs text-zinc-500 dark:text-zinc-400">
              Loading task details...
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Basic Information Section */}
            <div className="space-y-2.5">
              <h4 className="mb-2 font-semibold text-[10px] text-zinc-400 uppercase tracking-wider dark:text-zinc-500">
                Basic Information
              </h4>
              {task.name && (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center">
                    <Hash className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-[10px] text-zinc-500 dark:text-zinc-400">
                      Name
                    </div>
                    <div className="mt-0.5 break-words font-medium text-sm text-zinc-900 dark:text-zinc-100">
                      {task.name}
                    </div>
                  </div>
                </div>
              )}
              {locationString && (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center">
                    <MapPin className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-[10px] text-zinc-500 dark:text-zinc-400">
                      Location
                    </div>
                    <div className="mt-0.5 font-medium text-sm text-zinc-900 dark:text-zinc-100">
                      {locationString}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* IDs Section */}
            <div className="space-y-2.5">
              <h4 className="mb-2 font-semibold text-[10px] text-zinc-400 uppercase tracking-wider dark:text-zinc-500">
                Identifiers
              </h4>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center">
                  <Hash className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-[10px] text-zinc-500 dark:text-zinc-400">
                    Task ID
                  </div>
                  <div className="mt-0.5 font-medium text-sm text-zinc-900 dark:text-zinc-100">
                    {task.id}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center">
                  <Target className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-[10px] text-zinc-500 dark:text-zinc-400">
                    Challenge ID
                  </div>
                  <div className="mt-0.5 font-medium text-sm text-zinc-900 dark:text-zinc-100">
                    {task.parent}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center">
                  <FolderOpen className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-[10px] text-zinc-500 dark:text-zinc-400">
                    Project ID
                  </div>
                  <div className="mt-0.5 font-medium text-sm text-zinc-900 dark:text-zinc-100">
                    -
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata Section */}
            <div className="space-y-2.5">
              <h4 className="mb-2 font-semibold text-[10px] text-zinc-400 uppercase tracking-wider dark:text-zinc-500">
                Metadata
              </h4>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center">
                  <Target className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-[10px] text-zinc-500 dark:text-zinc-400">
                    Priority
                  </div>
                  <div className="mt-0.5 font-medium text-sm text-zinc-900 dark:text-zinc-100">
                    {task.priority}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center">
                  <Layers className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-[10px] text-zinc-500 dark:text-zinc-400">
                    Geometry Type
                  </div>
                  <div className="mt-0.5 font-medium text-sm text-zinc-900 dark:text-zinc-100">
                    {geometryType}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </TabsContent>

      {/* Properties Tab */}
      <TabsContent value="properties" className="m-0 min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-xs text-zinc-500 dark:text-zinc-400">
              Loading properties...
            </div>
          </div>
        ) : properties && Object.keys(properties).length > 0 ? (
          <div className="space-y-3">
            <h3 className="mb-3 font-semibold text-[10px] text-zinc-400 uppercase tracking-wider dark:text-zinc-500">
              Feature Properties
            </h3>
            <div className="space-y-2">
              {Object.entries(properties)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-md border border-zinc-200/50 bg-zinc-50/50 p-2.5 dark:border-zinc-800/50 dark:bg-zinc-800/30"
                  >
                    <div className="mb-1 font-semibold text-[10px] text-zinc-500 uppercase tracking-wide dark:text-zinc-400">
                      {key}
                    </div>
                    <div className="break-words font-medium text-sm text-zinc-900 dark:text-zinc-100">
                      {String(value)}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-xs text-zinc-500 dark:text-zinc-400">
              No feature properties available
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}

interface SingleTaskPopupProps {
  task: TaskMarker
  onClose: () => void
  showStartButton?: boolean
  mapRef?: React.RefObject<MapRef | null>
  markersHidden?: boolean
  onToggleMarkersHidden?: () => void
}

export const SingleTaskPopup = ({
  task: taskMarker,
  onClose,
  showStartButton = true,
  mapRef,
  markersHidden = false,
  onToggleMarkersHidden,
}: SingleTaskPopupProps) => {
  const { data: task, isLoading } = api.task.getTask(taskMarker.id)

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

    mapRef.current.flyTo({
      center: [taskMarker.location.lng, taskMarker.location.lat],
      zoom: 16,
      duration: 1000,
    })
  }

  const status = task?.status ?? 0
  const statusLabel = STATUS_LABELS[status] || 'Created'

  return (
    <div className="flex h-[400px] w-[300px] flex-col overflow-hidden overscroll-contain rounded-xl border border-zinc-200/50 bg-white/95 shadow-xl backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-900/95">
      {/* Header */}
      <div className="relative flex-shrink-0 border-zinc-200/50 border-b bg-gradient-to-r from-purple-50 to-white px-4 py-3 dark:border-zinc-800/50 dark:from-zinc-900 dark:to-zinc-900">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 rounded-md p-1 text-zinc-400 transition-colors hover:bg-white/50 hover:text-zinc-600 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-300"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 pr-8">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-sm">
            <MapPin className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Task #{task?.id ?? taskMarker.id}
            </h2>
            <div className="mt-1 flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-purple-500"></div>
              <span className="font-medium text-purple-600 text-xs dark:text-purple-400">
                {statusLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <TaskDetailTabs task={task ?? null} isLoading={isLoading} />

      {/* Action Buttons */}
      <div className="flex-shrink-0 space-y-2 border-zinc-200/50 border-t bg-zinc-50/50 px-4 py-2.5 dark:border-zinc-800/50 dark:bg-zinc-900/50">
        {onToggleMarkersHidden && (
          <Button
            onClick={onToggleMarkersHidden}
            variant="outline"
            className={`w-full shadow-sm transition-all hover:shadow-md ${
              markersHidden
                ? 'border-amber-500/50 bg-amber-50 text-amber-700 hover:border-amber-500 hover:bg-amber-100 dark:border-amber-600/50 dark:bg-amber-950/30 dark:text-amber-400 dark:hover:bg-amber-950/50'
                : 'border-zinc-300/50 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700/50 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            }`}
          >
            {markersHidden ? (
              <>
                <Eye className="mr-2 h-3.5 w-3.5" />
                Show Markers
              </>
            ) : (
              <>
                <EyeOff className="mr-2 h-3.5 w-3.5" />
                Hide Markers
              </>
            )}
          </Button>
        )}
        {mapRef && taskMarker.location && (
          <Button
            onClick={handleZoomToTask}
            variant="outline"
            className="w-full border-purple-500/50 bg-purple-50 text-purple-700 shadow-sm transition-all hover:border-purple-500 hover:bg-purple-100 hover:shadow-md dark:border-purple-600/50 dark:bg-purple-950/30 dark:text-purple-400 dark:hover:bg-purple-950/50"
          >
            <ZoomIn className="mr-2 h-3.5 w-3.5" />
            Zoom to Task
          </Button>
        )}
        {showStartButton && (
          <Button
            onClick={handleStartTask}
            variant="outline"
            className="w-full border-zinc-300/50 bg-white text-zinc-900 shadow-sm transition-all hover:border-zinc-400 hover:bg-zinc-50 hover:shadow-md dark:border-zinc-700/50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            disabled={isLoading || !task}
          >
            <Play className="mr-2 h-3.5 w-3.5" />
            Start Task
          </Button>
        )}
      </div>
    </div>
  )
}
