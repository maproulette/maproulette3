import type maplibregl from 'maplibre-gl'
import { ChevronDown, ChevronRight, ChevronUp, Layers, Loader2, MapPin, Play, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { api } from '@/api'
import { STATUS_CONFIG } from '@/components/shared/TaskMarkers/const'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/Collapsible'
import { router } from '@/main'
import type { Task, TaskMarker } from '@/types/Task'
import { useQuery } from '@tanstack/react-query'

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
    <div className="w-fit max-w-[90vw] max-h-[80vh] overflow-y-auto font-sans">
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
  taskId: number
  map: maplibregl.Map
  onClose?: () => void
}

const TASK_POPUP_SOURCE_ID = 'task-popup-feature'
const TASK_POPUP_LAYER_IDS = {
  point: 'task-popup-point',
  line: 'task-popup-line',
  fill: 'task-popup-fill',
  outline: 'task-popup-outline',
}

export const SingleTaskPopup = ({ taskId, map, onClose }: SingleTaskPopupProps) => {
  // Extract taskId from either prop or initialTask (only once)
 const { data: taskData, isLoading, error } = useQuery(api.task.getTask(taskId))
  const layersAddedRef = useRef<string[]>([])
  const [showProperties, setShowProperties] = useState(false)


  // Add/remove map visualization when task data is available
  useEffect(() => {
    if (!map || !taskData?.geometries) return

    const cleanup = () => {
      if (!map) return
      
      // Remove layers
      layersAddedRef.current.forEach((layerId) => {
        try {
          if (map.getLayer(layerId)) {
            map.removeLayer(layerId)
          }
        } catch {
          // Ignore errors
        }
      })
      layersAddedRef.current = []

      // Remove source
      try {
        if (map.getSource(TASK_POPUP_SOURCE_ID)) {
          map.removeSource(TASK_POPUP_SOURCE_ID)
        }
      } catch {
        // Ignore errors
      }
    }

    try {
      // Parse geometries - it can be a string or object
      let geometries: GeoJSON.FeatureCollection
      if (typeof taskData?.geometries === 'string') {
        geometries = JSON.parse(taskData?.geometries)
      } else {
        geometries = taskData?.geometries as GeoJSON.FeatureCollection
      }

      if (!geometries || !geometries.features || geometries.features.length === 0) {
        return
      }

      // Add source
      if (map.getSource(TASK_POPUP_SOURCE_ID)) {
        const source = map.getSource(TASK_POPUP_SOURCE_ID) as maplibregl.GeoJSONSource
        source.setData(geometries)
      } else {
        map.addSource(TASK_POPUP_SOURCE_ID, {
          type: 'geojson',
          data: geometries,
        })
      }

      // Determine geometry types and add appropriate layers
      const hasPoint = geometries.features.some((f) => f.geometry.type === 'Point')
      const hasLineString = geometries.features.some((f) => f.geometry.type === 'LineString')
      const hasPolygon = geometries.features.some((f) => f.geometry.type === 'Polygon')

      // Add point layer (blue circle)
      if (hasPoint && !map.getLayer(TASK_POPUP_LAYER_IDS.point)) {
        map.addLayer({
          id: TASK_POPUP_LAYER_IDS.point,
          type: 'circle',
          source: TASK_POPUP_SOURCE_ID,
          filter: ['==', ['geometry-type'], 'Point'],
          paint: {
            'circle-radius': 8,
            'circle-color': '#3b82f6', // blue-500
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 2,
            'circle-opacity': 0.8,
          },
        })
        layersAddedRef.current.push(TASK_POPUP_LAYER_IDS.point)
      }

      // Add line layer (blue line)
      if (hasLineString && !map.getLayer(TASK_POPUP_LAYER_IDS.line)) {
        map.addLayer({
          id: TASK_POPUP_LAYER_IDS.line,
          type: 'line',
          source: TASK_POPUP_SOURCE_ID,
          filter: ['==', ['geometry-type'], 'LineString'],
          paint: {
            'line-color': '#3b82f6', // blue-500
            'line-width': 3,
            'line-opacity': 0.8,
          },
        })
        layersAddedRef.current.push(TASK_POPUP_LAYER_IDS.line)
      }

      // Add polygon layers (fill + outline)
      if (hasPolygon) {
        if (!map.getLayer(TASK_POPUP_LAYER_IDS.fill)) {
          map.addLayer({
            id: TASK_POPUP_LAYER_IDS.fill,
            type: 'fill',
            source: TASK_POPUP_SOURCE_ID,
            filter: ['==', ['geometry-type'], 'Polygon'],
            paint: {
              'fill-color': '#3b82f6', // blue-500
              'fill-opacity': 0.2,
            },
          })
          layersAddedRef.current.push(TASK_POPUP_LAYER_IDS.fill)
        }

        if (!map.getLayer(TASK_POPUP_LAYER_IDS.outline)) {
          map.addLayer({
            id: TASK_POPUP_LAYER_IDS.outline,
            type: 'line',
            source: TASK_POPUP_SOURCE_ID,
            filter: ['==', ['geometry-type'], 'Polygon'],
            paint: {
              'line-color': '#3b82f6', // blue-500
              'line-width': 3,
              'line-opacity': 0.8,
            },
          })
          layersAddedRef.current.push(TASK_POPUP_LAYER_IDS.outline)
        }
      }
    } catch (error) {
      console.error('Error adding task feature to map:', error)
    }

    return cleanup
  }, [map, taskData])



  if (isLoading || !taskData) {
    return (
      <div className="w-fit max-w-[90vw] max-h-[80vh] font-sans">
        <div className="flex items-center justify-center gap-2 py-8">
          <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
          <span className="text-sm text-zinc-500">Loading task data...</span>
        </div>
      </div>
    )
  }

  // For backward compatibility, if we have initialTask but no fetched task, use initialTask
  const displayTask = taskData 

  if (error) {
    return (
      <div className="w-fit max-w-[90vw] max-h-[80vh] font-sans">
        <div className="py-4 text-center">
          <p className="text-red-600 text-sm">Failed to load task data</p>
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

  if (!displayTask) {
    return null
  }

  const statusInfo = getStatusConfig(displayTask.status ?? 0)


  const formatCoordinates = (location: Task['location']) => {
    if (!location) return 'N/A'
    if (typeof location === 'string') {
      try {
        const parsed = JSON.parse(location)
        if (parsed?.coordinates) {
          const [lng, lat] = parsed.coordinates
          return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        }
      } catch {
        return 'N/A'
      }
    }
    if (typeof location === 'object' && 'coordinates' in location) {
      const [lng, lat] = (location as { coordinates: [number, number] }).coordinates
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }
    return 'N/A'
  }
  const geo = typeof taskData?.geometries === 'string' 
  ? JSON.parse(taskData?.geometries) 
  : taskData?.geometries
  // Extract properties from geometries
  const geometryProperties = geo.features[0].properties as Record<string, string | number | boolean>

  return (
    <div className="w-fit max-w-[90vw] max-h-[80vh] overflow-y-auto font-sans">
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
            <h3 className="font-semibold text-[15px] text-zinc-800">Task #{displayTask.id}</h3>
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

      {/* Basic Info */}
      {taskData && (
        <div className="mb-3 space-y-2 text-xs">
          {taskData.name && (
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500">Name:</span>
              <span className="font-medium text-zinc-800">{taskData.name}</span>
            </div>
          )}
          {taskData.location && (
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500">Location:</span>
              <span className="font-medium text-zinc-800">{formatCoordinates(taskData.location)}</span>
            </div>
          )}
        </div>
      )}


        <div className="mb-2 pb-2 border-zinc-200 border-b dark:border-zinc-700">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Task ID:</span>
                  <span className="font-medium text-zinc-800">{taskData.id}</span>
                </div>
                {taskData.parent && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Challenge ID:</span>
                    <span className="font-medium text-zinc-800">{taskData.parent}</span>
                  </div>
                )}
                {taskData.priority !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Priority:</span>
                    <span className="font-medium text-zinc-800">{taskData.priority}</span>
                  </div>
                )}
                {taskData.bundleId && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Bundle ID:</span>
                    <span className="font-medium text-zinc-800">{taskData.bundleId}</span>
                  </div>
                )}
                {taskData.changesetId !== undefined && taskData.changesetId !== -1 && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Changeset ID:</span>
                    <span className="font-medium text-zinc-800">{taskData.changesetId}</span>
                  </div>
                )}
                {taskData.geometries && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Geometry Type:</span>
                    <span className="font-medium text-zinc-800">
                      {(() => {
                        try {
                          const geo = typeof taskData.geometries === 'string' 
                            ? JSON.parse(taskData.geometries) 
                            : taskData.geometries
                          if (geo?.features?.[0]?.geometry?.type) {
                            return geo.features[0].geometry.type
                          }
                          return 'Unknown'
                        } catch {
                          return 'Unknown'
                        }
                      })()}
                    </span>
                  </div>
                )}
              </div>
            </div>


        <Collapsible open={showProperties} onOpenChange={setShowProperties} className="mb-3">
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800">
            <span>Task Info</span>
            {showProperties ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-2 border-zinc-100 border-t pt-2 text-xs">



            {/* Geometry Properties */}
            {geometryProperties && (
              <div>
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                  Feature Properties
                </div>
                <div className="max-h-[200px] space-y-1.5 overflow-y-auto">
                  {Object.entries(geometryProperties)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([key, value]) => (
                      <div key={key} className="flex items-start justify-between gap-2">
                        <span className="text-zinc-500 break-words">{key}:</span>
                        <span className="font-medium text-zinc-800 text-right break-words">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Additional Task Info */}
            {(taskData.errorTags || taskData.instruction || (() => {
              const taskWithTags = taskData as Task & { tags?: string[] }
              return taskWithTags.tags && Array.isArray(taskWithTags.tags) && taskWithTags.tags.length > 0
            })()) && (
              <div className="mt-2 pt-2 border-zinc-200 border-t dark:border-zinc-700">
                {taskData.errorTags && (
                  <div className="mb-1.5 flex flex-col gap-1">
                    <span className="text-zinc-500">Error Tags:</span>
                    <span className="font-medium text-zinc-800">{taskData.errorTags}</span>
                  </div>
                )}
                {(() => {
                  const taskWithTags = taskData as Task & { tags?: string[] }
                  return taskWithTags.tags && Array.isArray(taskWithTags.tags) && taskWithTags.tags.length > 0 ? (
                    <div className="mb-1.5 flex flex-col gap-1">
                      <span className="text-zinc-500">Tags:</span>
                      <div className="flex flex-wrap gap-1">
                        {taskWithTags.tags.map((tag: string, idx: number) => (
                          <span
                            key={idx}
                            className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null
                })()}
                {taskData.instruction && (
                  <div className="flex flex-col gap-1">
                    <span className="text-zinc-500">Instruction:</span>
                    <span className="font-medium text-zinc-800">{taskData.instruction || 'None'}</span>
                  </div>
                )}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

    </div>
  )
}
