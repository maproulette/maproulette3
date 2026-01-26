import { ChevronDown, Eye, EyeOff, Hash, Layers, MapPin, Package, Target, Trash2, X, ZoomIn } from 'lucide-react'
import { useState } from 'react'
import { api } from '@/api'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/Collapsible'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { cn } from '@/lib/utils'
import { getTaskFeatureProperties } from '@/plugins/RapidEditorPlugin/editorUtils'
import type { Task } from '@/types/Task'
import { useTaskBundleContext } from '../contexts/TaskBundleContext'
import { useTaskContext } from '../contexts/TaskContext'
import { useTaskMapContext } from '../contexts/TaskMapContext'

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
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }
  } catch (error) {
    console.error('Failed to parse task location:', error)
  }

  return null
}

const calculateGeometryBounds = (task: Task): [[number, number], [number, number]] | null => {
  if (!task.geometries) return null

  try {
    const geometries =
      typeof task.geometries === 'string' ? JSON.parse(task.geometries) : task.geometries

    let minLng = Infinity
    let maxLng = -Infinity
    let minLat = Infinity
    let maxLat = -Infinity

    const processCoordinates = (coords: unknown): void => {
      if (Array.isArray(coords)) {
        if (coords.length >= 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
          const [lng, lat] = coords
          if (Number.isFinite(lng) && Number.isFinite(lat)) {
            minLng = Math.min(minLng, lng)
            maxLng = Math.max(maxLng, lng)
            minLat = Math.min(minLat, lat)
            maxLat = Math.max(maxLat, lat)
          }
        } else {
          coords.forEach(processCoordinates)
        }
      }
    }

    const processGeometry = (geom: { type: string; coordinates?: unknown }) => {
      if (geom.coordinates) {
        processCoordinates(geom.coordinates)
      }
    }

    if (geometries.type === 'FeatureCollection' && geometries.features) {
      geometries.features.forEach((feature: { geometry?: { type: string; coordinates?: unknown } }) => {
        if (feature.geometry) {
          processGeometry(feature.geometry)
        }
      })
    } else if (geometries.type === 'Feature' && geometries.geometry) {
      processGeometry(geometries.geometry)
    } else if (geometries.coordinates) {
      processGeometry(geometries)
    }

    if (
      !Number.isFinite(minLng) ||
      !Number.isFinite(maxLng) ||
      !Number.isFinite(minLat) ||
      !Number.isFinite(maxLat)
    ) {
      return null
    }

    return [
      [minLng, minLat],
      [maxLng, maxLat],
    ]
  } catch (error) {
    console.error('Failed to calculate geometry bounds:', error)
    return null
  }
}

export const SelectedDataPanel = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<'info' | 'properties'>('info')
  const { selectedMarker, setSelectedMarker, map, markersHidden, setMarkersHidden } = useTaskMapContext()
  const { task: primaryTask } = useTaskContext()
  const { activeBundle, setActiveBundle, bundleEditsDisabled, clearBundle, setInitialBundle } =
    useTaskBundleContext()

  // Fetch full task data
  const { data: task, isLoading } = api.task.getTask(selectedMarker?.id ?? 0)

  // Don't render if no marker is selected
  if (!selectedMarker) {
    return null
  }

  const handleClose = () => {
    setSelectedMarker(null)
  }

  const handleZoomToTask = () => {
    if (!map?.current || !task) return

    // Calculate bounding box from task geometries
    const bounds = calculateGeometryBounds(task)
    if (bounds) {
      map.current.fitBounds(bounds, {
        padding: 50,
        duration: 1000,
        maxZoom: 18,
      })
    } else if (selectedMarker.location) {
      // Fallback to center point if no geometries
      map.current.flyTo({
        center: [selectedMarker.location.lng, selectedMarker.location.lat],
        zoom: 16,
        duration: 1000,
      })
    }
  }

  const handleAddToBundle = () => {
    if (bundleEditsDisabled || !selectedMarker) return

    if (!activeBundle) {
      const newBundle = {
        bundleId: 0,
        taskIds: [primaryTask.id, selectedMarker.id],
        tasks: [primaryTask].filter(Boolean),
        name: `Bundle (pending)`,
      }
      setActiveBundle(newBundle)
      setInitialBundle(null)
    } else {
      if (activeBundle.taskIds.includes(selectedMarker.id)) {
        return
      }
      const updatedTaskIds = [...activeBundle.taskIds, selectedMarker.id]
      setActiveBundle({
        ...activeBundle,
        taskIds: updatedTaskIds,
        tasks: activeBundle.tasks,
      })
    }
  }

  const handleRemoveFromBundle = () => {
    if (!activeBundle || bundleEditsDisabled || !selectedMarker) return

    if (selectedMarker.id === primaryTask.id) {
      return
    }

    if (!activeBundle.taskIds.includes(selectedMarker.id)) {
      return
    }

    const updatedTasks = (activeBundle.tasks || []).filter((t) => t.id !== selectedMarker.id)
    const updatedTaskIds = activeBundle.taskIds.filter((id) => id !== selectedMarker.id)

    if (updatedTaskIds.length <= 1) {
      clearBundle()
      return
    }

    setActiveBundle({
      ...activeBundle,
      taskIds: updatedTaskIds,
      tasks: updatedTasks,
    })
  }

  const status = task?.status ?? 0
  const statusLabel = STATUS_LABELS[status] || 'Created'
  const properties = task ? getTaskFeatureProperties(task) : null
  const geometryType = task ? getGeometryType(task) : 'Unknown'
  const locationString = task ? getLocationString(task) : null

  const isInBundle = activeBundle?.taskIds.includes(selectedMarker.id) ?? false
  const isPrimaryTask = primaryTask.id === selectedMarker.id
  const canBundleTask = !isInBundle && !isPrimaryTask && !bundleEditsDisabled
  const canRemoveFromBundle = activeBundle && isInBundle && !isPrimaryTask && !bundleEditsDisabled

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-purple-200 dark:border-purple-800">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-purple-500 to-purple-600">
                <MapPin className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="text-left">
                <CardTitle className="font-semibold text-sm">Selected Data</CardTitle>
                <p className="font-medium text-purple-600 text-xs dark:text-purple-400">
                  Task #{selectedMarker.id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleClose()
                }}
                className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-gray-500 transition-transform duration-200',
                  isOpen && 'rotate-180'
                )}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        {isOpen && (
          <CollapsibleContent>
            <CardContent className="px-4 py-3">
              {/* Status Badge */}
              <div className="mb-3 flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                <span className="font-medium text-purple-600 text-xs dark:text-purple-400">
                  {statusLabel}
                </span>
              </div>

              {/* Tabs */}
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as 'info' | 'properties')}
                className="w-full"
              >
                <TabsList className="mb-3 h-auto w-full gap-1 bg-zinc-100 p-1 dark:bg-zinc-800">
                  <TabsTrigger
                    value="info"
                    className="flex-1 rounded-md px-3 py-1.5 font-medium text-xs data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-700 dark:data-[state=active]:text-purple-400"
                  >
                    Task Info
                  </TabsTrigger>
                  <TabsTrigger
                    value="properties"
                    className="flex-1 rounded-md px-3 py-1.5 font-medium text-xs data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-700 dark:data-[state=active]:text-purple-400"
                  >
                    Properties
                  </TabsTrigger>
                </TabsList>

                {/* Task Info Tab */}
                <TabsContent value="info" className="m-0 max-h-64 overflow-y-auto overscroll-contain">
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
                        {task?.name && (
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
                              {selectedMarker.id}
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
                              {task?.parent ?? '-'}
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
                              {task?.priority ?? '-'}
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
                <TabsContent value="properties" className="m-0 max-h-64 overflow-y-auto overscroll-contain">
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

              {/* Bundle Buttons */}
              <div className="mt-4 space-y-2">
                {canBundleTask ? (
                  <Button
                    onClick={handleAddToBundle}
                    variant="outline"
                    size="sm"
                    className="w-full border-green-500/50 bg-green-50 text-green-700 shadow-sm transition-all hover:border-green-500 hover:bg-green-100 hover:shadow-md dark:border-green-600/50 dark:bg-green-950/30 dark:text-green-400 dark:hover:bg-green-950/50"
                  >
                    <Package className="mr-2 h-3.5 w-3.5" />
                    Bundle this task
                  </Button>
                ) : canRemoveFromBundle ? (
                  <Button
                    onClick={handleRemoveFromBundle}
                    variant="outline"
                    size="sm"
                    className="w-full border-red-500/50 bg-red-50 text-red-700 shadow-sm transition-all hover:border-red-500 hover:bg-red-100 hover:shadow-md dark:border-red-600/50 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Remove from Bundle
                  </Button>
                ) : isInBundle && isPrimaryTask ? (
                  <div className="flex items-center justify-center gap-2 rounded-md bg-purple-50 px-3 py-2 font-medium text-purple-700 text-xs dark:bg-purple-900/30 dark:text-purple-400">
                    <Package className="h-3.5 w-3.5" />
                    Primary task in bundle
                  </div>
                ) : isInBundle ? (
                  <div className="flex items-center justify-center gap-2 rounded-md bg-zinc-100 px-3 py-2 font-medium text-xs text-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-400">
                    <Package className="h-3.5 w-3.5" />
                    In bundle
                  </div>
                ) : null}

                {/* Action Buttons */}
                <Button
                  onClick={() => setMarkersHidden(!markersHidden)}
                  variant="outline"
                  size="sm"
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

                {(task?.geometries || selectedMarker.location) && (
                  <Button
                    onClick={handleZoomToTask}
                    variant="outline"
                    size="sm"
                    className="w-full border-purple-500/50 bg-purple-50 text-purple-700 shadow-sm transition-all hover:border-purple-500 hover:bg-purple-100 hover:shadow-md dark:border-purple-600/50 dark:bg-purple-950/30 dark:text-purple-400 dark:hover:bg-purple-950/50"
                  >
                    <ZoomIn className="mr-2 h-3.5 w-3.5" />
                    Zoom to Task
                  </Button>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        )}
      </Card>
    </Collapsible>
  )
}
