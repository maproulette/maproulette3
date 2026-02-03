import { useNavigate } from '@tanstack/react-router'
import { Braces, FileText, GitCommit, MessageSquare, Play, X, ZoomIn } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { MapRef } from 'react-map-gl/maplibre'
import { api } from '@/api'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { cn } from '@/lib/utils'
import type { Task, TaskMarker } from '@/types/Task'

const STATUS_LABELS: Record<number, string> = {
  0: 'Created',
  1: 'Fixed',
  2: 'False Positive',
  3: 'Skipped',
  4: 'Deleted',
  5: 'Already Fixed',
  6: 'Too Hard',
}

const STATUS_COLORS: Record<number, string> = {
  0: 'bg-zinc-500',
  1: 'bg-green-500',
  2: 'bg-red-500',
  3: 'bg-yellow-500',
  4: 'bg-zinc-400',
  5: 'bg-blue-500',
  6: 'bg-orange-500',
}

const tabTriggerClass =
  'gap-1.5 rounded-none border-transparent border-b-2 bg-transparent px-3 py-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 dark:data-[state=active]:border-blue-400 dark:data-[state=active]:text-blue-400'

const parseTaskProperties = (task: Task): Record<string, unknown> | null => {
  if (!task.geometries) return null

  try {
    const geometries =
      typeof task.geometries === 'string' ? JSON.parse(task.geometries) : task.geometries

    if (geometries.type === 'FeatureCollection' && geometries.features?.length > 0) {
      return geometries.features[0]?.properties || null
    } else if (geometries.type === 'Feature') {
      return geometries.properties || null
    }
  } catch (error) {
    console.error('Failed to parse task geometries:', error)
  }

  return null
}

// Lazy-load the heavy tab components to avoid circular imports
// CommentsHistoryTab and OSMHistoryTab live in TaskEditPage but we import them directly
import { CommentsHistoryTab } from '@/components/TaskEditPage/TaskPanel/CommentsHistoryTab'
import { OSMHistoryTab } from '@/components/TaskEditPage/TaskPanel/OSMHistoryTab'

interface TaskInfoDrawerProps {
  selectedTask: TaskMarker | null
  onClose: () => void
  mapRef: React.RefObject<MapRef | null>
}

export const TaskInfoDrawer = ({ selectedTask, onClose, mapRef }: TaskInfoDrawerProps) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('task')
  // 'closed' | 'open' | 'sliding-out' (animating out before switching task)
  const [drawerState, setDrawerState] = useState<'closed' | 'open' | 'sliding-out'>('closed')

  const { data: fullTask } = api.task.getTask(selectedTask?.id ?? 0)
  const task = fullTask as Task | undefined

  const commentsQueryResult = api.task.getTaskComments(selectedTask?.id ?? 0)
  const commentsCount = commentsQueryResult.data?.length ?? 0
  const osmHistoryCount = task?.changesetId && task.changesetId > 0 ? 1 : 0

  const shouldBeOpen = selectedTask !== null
  const targetTaskId = selectedTask?.id ?? null

  // Track the previous target to detect task switches
  const prevTargetRef = useRef(targetTaskId)
  useEffect(() => {
    const prevTarget = prevTargetRef.current
    prevTargetRef.current = targetTaskId

    if (!shouldBeOpen) {
      setDrawerState('closed')
      return
    }

    if (drawerState === 'closed') {
      setDrawerState('open')
    } else if (drawerState === 'open' && prevTarget !== targetTaskId) {
      // Task changed while open — slide out, wait for animation, then slide back in
      setDrawerState('sliding-out')
      const timer = setTimeout(() => {
        setDrawerState('open')
      }, 320) // slightly longer than the 300ms CSS transition
      return () => clearTimeout(timer)
    }
  }, [shouldBeOpen, targetTaskId]) // eslint-disable-line react-hooks/exhaustive-deps

  const isOpen = drawerState === 'open'

  const handleStartTask = () => {
    if (task) {
      navigate({
        to: '/tasks/$taskId',
        params: { taskId: task.id.toString() },
      })
    }
  }

  const handleZoomToTask = () => {
    if (!mapRef?.current || !selectedTask?.location) return
    mapRef.current.flyTo({
      center: [selectedTask.location.lng, selectedTask.location.lat],
      zoom: 16,
      duration: 1000,
    })
  }

  const status = task?.status ?? selectedTask?.status ?? 0
  const statusLabel = STATUS_LABELS[status] || 'Unknown'
  const statusColor = STATUS_COLORS[status] || 'bg-zinc-500'

  const properties = task ? parseTaskProperties(task) : null

  return (
    <Drawer open={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="shrink-0 space-y-2 border-zinc-200 border-b bg-gradient-to-r from-purple-200 via-purple-100/50 to-transparent px-4 pt-3 pb-3 dark:border-zinc-800 dark:from-purple-800/50 dark:via-purple-900/25 dark:to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Task #{selectedTask?.id}
            </span>
            <div
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-0.5 font-medium text-[10px] text-white',
                statusColor
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
              {statusLabel}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            aria-label="Close drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      {isOpen && task && (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="shrink-0 border-zinc-200 border-b dark:border-zinc-800">
            <TabsList className="h-auto w-full justify-start gap-1 rounded-none bg-transparent p-0">
              <TabsTrigger value="task" className={tabTriggerClass}>
                <FileText className="h-3.5 w-3.5" />
                <span className="text-xs">Task</span>
              </TabsTrigger>
              <TabsTrigger value="properties" className={tabTriggerClass}>
                <Braces className="h-3.5 w-3.5" />
                <span className="text-xs">Properties</span>
              </TabsTrigger>
              <TabsTrigger value="comments" className={tabTriggerClass}>
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="text-xs">Comments ({commentsCount})</span>
              </TabsTrigger>
              <TabsTrigger value="osm" className={tabTriggerClass}>
                <GitCommit className="h-3.5 w-3.5" />
                <span className="text-xs">OSM ({osmHistoryCount})</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="min-h-0 flex-1">
            <div className="p-4">
              <TabsContent value="task" className="mt-0">
                <div className="space-y-3">
                  {task.name && task.name !== String(task.id) && (
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="text-zinc-400 dark:text-zinc-500">Name: </span>
                      {task.name}
                    </div>
                  )}
                  <div className="flex gap-2">
                    {selectedTask?.location && (
                      <Button
                        onClick={handleZoomToTask}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-purple-500/50 bg-purple-50 text-purple-700 shadow-sm transition-all hover:border-purple-500 hover:bg-purple-100 hover:shadow-md dark:border-purple-600/50 dark:bg-purple-950/30 dark:text-purple-400 dark:hover:bg-purple-950/50"
                      >
                        <ZoomIn className="mr-1.5 h-3.5 w-3.5" />
                        Zoom
                      </Button>
                    )}
                    <Button
                      onClick={handleStartTask}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-zinc-300/50 bg-white text-zinc-900 shadow-sm transition-all hover:border-zinc-400 hover:bg-zinc-50 hover:shadow-md dark:border-zinc-700/50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                    >
                      <Play className="mr-1.5 h-3.5 w-3.5" />
                      Start Task
                    </Button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="properties" className="mt-0">
                {properties && Object.keys(properties).length > 0 ? (
                  <div className="space-y-1">
                    {Object.entries(properties).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-start justify-between gap-2 rounded bg-zinc-100 px-2 py-1.5 text-xs dark:bg-zinc-800/50"
                      >
                        <span className="font-medium text-zinc-500 dark:text-zinc-400">{key}</span>
                        <span className="text-right font-mono text-zinc-900 dark:text-zinc-100">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value ?? '')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    No properties available for this task.
                  </p>
                )}
              </TabsContent>
              <TabsContent value="comments" className="mt-0">
                <CommentsHistoryTab task={task} />
              </TabsContent>
              <TabsContent value="osm" className="mt-0">
                <OSMHistoryTab task={task} />
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      )}
    </Drawer>
  )
}
