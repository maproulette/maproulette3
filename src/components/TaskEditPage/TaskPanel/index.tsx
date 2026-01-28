import {
  Braces,
  FileText,
  GitCommit, MessageSquare,
  Star,
  X
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { api } from '@/api'
import { Drawer } from '@/components/ui/Drawer'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { cn } from '@/lib/utils'
import type { Task, TaskMarker } from '@/types/Task'
import { useChallengeContext } from '../contexts/ChallengeContext'
import { useTaskBundleContext } from '../contexts/TaskBundleContext'
import { useTaskContext } from '../contexts/TaskContext'
import { useTaskMapContext } from '../contexts/TaskMapContext'
import { CommentsHistoryTab } from './CommentsHistoryTab'
import { OSMHistoryTab } from './OSMHistoryTab'
import { LocationTab, PropertiesTab, TaskTab } from './TaskInfoTab'

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

type TaskRelation = 'primary' | 'bundle' | 'selection'

const HEADER_GRADIENTS: Record<TaskRelation, string> = {
  primary: 'bg-gradient-to-r from-amber-200 via-amber-100/50 to-transparent dark:from-amber-800/50 dark:via-amber-900/25 dark:to-transparent',
  bundle: 'bg-gradient-to-r from-green-200 via-green-100/50 to-transparent dark:from-green-800/50 dark:via-green-900/25 dark:to-transparent',
  selection: 'bg-gradient-to-r from-purple-200 via-purple-100/50 to-transparent dark:from-purple-800/50 dark:via-purple-900/25 dark:to-transparent',
}

const TaskInfoHeader = ({
  task,
  relation,
}: {
  task: Task
  relation: TaskRelation
}) => {
  const { challenge } = useChallengeContext()
  const { data: project } = api.project.getProject(challenge?.parent)

  const status = task.status ?? 0
  const statusLabel = STATUS_LABELS[status] || 'Unknown'
  const statusColor = STATUS_COLORS[status] || 'bg-zinc-500'

  return (
    <div className={cn('shrink-0 space-y-2 border-zinc-200 border-b px-4 pt-3 pb-3 dark:border-zinc-800', HEADER_GRADIENTS[relation])}>
      {/* Task ID + Status + Primary badge */}
      <div className="flex items-center gap-2">
        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
          Task #{task.id}
        </span>
        <div
          className={cn(
            'flex items-center gap-1 rounded-full px-2 py-0.5 font-medium text-white text-[10px]',
            statusColor
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
          {statusLabel}
        </div>
        {relation === 'primary' && (
          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-medium text-[10px] text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            <Star className="h-3 w-3 fill-current" />
            Primary
          </span>
        )}
      </div>

      {/* Task name */}
      {task.name && task.name !== String(task.id) && (
        <p className="break-all font-mono text-xs text-zinc-500 dark:text-zinc-400">
          {task.name}
        </p>
      )}

      {/* OSM ID (from task name which is often the OSM ID) */}
      {task.name && (
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          <span className="text-zinc-400 dark:text-zinc-500">OSM ID: </span>
          {task.name}
        </div>
      )}

      {/* Challenge name */}
      {challenge && (
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          <span className="text-zinc-400 dark:text-zinc-500">Challenge: </span>
          {challenge.name}
        </div>
      )}

      {/* Project name */}
      {project && (
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          <span className="text-zinc-400 dark:text-zinc-500">Project: </span>
          {project.displayName ?? project.name}
        </div>
      )}
    </div>
  )
}

const tabTriggerClass =
  'gap-1.5 rounded-none border-transparent border-b-2 bg-transparent px-3 py-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 dark:data-[state=active]:border-blue-400 dark:data-[state=active]:text-blue-400'

const TaskTabs = ({
  task,
  isPrimaryTask,
  isInBundle,
  canAddToBundle,
  canRemoveFromBundle,
  onAddToBundle,
  onRemoveFromBundle,
  nonPrimaryBundleTaskIds,
  onOpenBundleTask,
}: {
  task: Task
  isPrimaryTask: boolean
  isInBundle: boolean
  canAddToBundle: boolean
  canRemoveFromBundle: boolean
  onAddToBundle: () => void
  onRemoveFromBundle: () => void
  nonPrimaryBundleTaskIds?: number[]
  onOpenBundleTask?: (taskId: number) => void
}) => {
  const [activeTab, setActiveTab] = useState('task')
  const commentsQueryResult = api.task.getTaskComments(task.id)
  const commentsCount = commentsQueryResult.data?.length ?? 0
  const osmHistoryCount = task.changesetId && task.changesetId > 0 ? 1 : 0

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-zinc-200 border-b px-4 dark:border-zinc-800">
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
            <TaskTab
              task={task}
              isPrimaryTask={isPrimaryTask}
              isInBundle={isInBundle}
              canAddToBundle={canAddToBundle}
              canRemoveFromBundle={canRemoveFromBundle}
              onAddToBundle={onAddToBundle}
              onRemoveFromBundle={onRemoveFromBundle}
              nonPrimaryBundleTaskIds={nonPrimaryBundleTaskIds}
              onOpenBundleTask={onOpenBundleTask}
            />
          </TabsContent>
          <TabsContent value="properties" className="mt-0">
            <PropertiesTab task={task} />
          </TabsContent>
          <TabsContent value="comments" className="mt-0">
            <CommentsHistoryTab task={task} />
          </TabsContent>
          <TabsContent value="osm" className="mt-0">
            <OSMHistoryTab task={task} />
          </TabsContent>
          <TabsContent value="location" className="mt-0">
            <LocationTab task={task} />
          </TabsContent>
        </div>
      </ScrollArea>
    </Tabs>
  )
}

export const TaskPanel = () => {
  const { task: primaryTask } = useTaskContext()
  const { activeBundle, setActiveBundle, setInitialBundle, bundleEditsDisabled } =
    useTaskBundleContext()
  const { selectedMarker, setSelectedMarker, setActiveTaskId, emptyClickCount } =
    useTaskMapContext()
  const [drawerTaskId, setDrawerTaskId] = useState<number | null>(null)
  // 'closed' | 'open' | 'sliding-out' (animating out before switching task)
  const [drawerState, setDrawerState] = useState<'closed' | 'open' | 'sliding-out'>('closed')

  const bundleTaskIds = activeBundle?.taskIds ?? [primaryTask.id]
  const isNonBundleSelection = selectedMarker && !bundleTaskIds.includes(selectedMarker.id)

  // The logical task the drawer should show
  const targetTaskId = isNonBundleSelection
    ? selectedMarker.id
    : drawerTaskId ?? primaryTask.id
  const shouldBeOpen = drawerTaskId !== null || !!isNonBundleSelection

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

  const drawerOpen = drawerState === 'open'
  const viewedTaskId = targetTaskId

  // Fetch the viewed task data (skip if it's the primary task)
  const { data: fetchedTask } = api.task.getTask(viewedTaskId !== primaryTask.id ? viewedTaskId : 0)
  const viewedTask: Task =
    viewedTaskId === primaryTask.id ? primaryTask : (fetchedTask ?? primaryTask)

  // When the bundle changes, close drawer if task is no longer in bundle
  useEffect(() => {
    if (drawerTaskId !== null && !bundleTaskIds.includes(drawerTaskId)) {
      setDrawerTaskId(null)
    }
  }, [bundleTaskIds, drawerTaskId])

  // When a bundle task is clicked on the map, open it in the drawer
  useEffect(() => {
    if (selectedMarker && bundleTaskIds.includes(selectedMarker.id) && selectedMarker.id !== primaryTask.id) {
      setDrawerTaskId(selectedMarker.id)
      setSelectedMarker(null)
    }
  }, [selectedMarker, bundleTaskIds, setSelectedMarker, primaryTask.id])

  // Keep the map's active task ID in sync
  useEffect(() => {
    setActiveTaskId(viewedTaskId)
  }, [viewedTaskId, setActiveTaskId])

  // When empty space on map is clicked, close drawer
  useEffect(() => {
    if (emptyClickCount > 0) {
      setDrawerTaskId(null)
      setSelectedMarker(null)
    }
  }, [emptyClickCount, setSelectedMarker])

  const handleCloseDrawer = () => {
    setDrawerTaskId(null)
    setSelectedMarker(null)
  }

  const handleAddToBundle = () => {
    if (bundleEditsDisabled || !selectedMarker) return

    if (!activeBundle) {
      const newBundle = {
        bundleId: 0,
        taskIds: [primaryTask.id, selectedMarker.id],
        tasks: [primaryTask],
        name: `Bundle (pending)`,
      }
      setActiveBundle(newBundle)
      setInitialBundle(null)
    } else {
      if (activeBundle.taskIds.includes(selectedMarker.id)) return
      setActiveBundle({
        ...activeBundle,
        taskIds: [...activeBundle.taskIds, selectedMarker.id],
        tasks: activeBundle.tasks,
      })
    }

    // Move the newly added task into the drawer as a bundle task
    const addedId = selectedMarker.id
    setSelectedMarker(null)
    setDrawerTaskId(addedId)
  }

  const handleRemoveFromBundle = () => {
    if (bundleEditsDisabled || !activeBundle) return
    if (viewedTaskId === primaryTask.id) return

    const removedTaskId = viewedTaskId
    const removedTask = viewedTask

    const updatedTaskIds = activeBundle.taskIds.filter((id) => id !== removedTaskId)

    if (updatedTaskIds.length <= 1) {
      setActiveBundle(null)
      setInitialBundle(null)
    } else {
      setActiveBundle({
        ...activeBundle,
        taskIds: updatedTaskIds,
        tasks: activeBundle.tasks,
      })
    }

    // Show removed task as non-bundle selection in drawer
    const taskLocation =
      typeof removedTask.location === 'object' && removedTask.location
        ? removedTask.location
        : { lng: 0, lat: 0 }
    const removedTaskMarker: TaskMarker = {
      id: removedTaskId,
      location: taskLocation,
      status: removedTask.status ?? 0,
      priority: removedTask.priority ?? 0,
    }
    setSelectedMarker(removedTaskMarker)
    setDrawerTaskId(null)
  }

  const isViewedTaskInBundle = activeBundle?.taskIds.includes(viewedTaskId) ?? false
  const isViewedTaskPrimary = viewedTaskId === primaryTask.id
  const canRemoveFromBundle =
    activeBundle && isViewedTaskInBundle && !isViewedTaskPrimary && !bundleEditsDisabled

  // Non-primary bundle task IDs for listing
  const nonPrimaryBundleTaskIds = bundleTaskIds.filter((id) => id !== primaryTask.id)

  return (
    <div className="relative flex w-full flex-col overflow-hidden border border-zinc-200 bg-white md:h-[calc(100vh-11rem)] md:rounded-r-none dark:border-zinc-800 dark:bg-zinc-950">
      {/* Primary Task Info Header */}
      <TaskInfoHeader task={primaryTask} relation="primary" />

      {/* Primary Task Tabs */}
      <TaskTabs
        task={primaryTask}
        isPrimaryTask={true}
        isInBundle={!!activeBundle}
        canAddToBundle={false}
        canRemoveFromBundle={false}
        onAddToBundle={() => {}}
        onRemoveFromBundle={() => {}}
        nonPrimaryBundleTaskIds={nonPrimaryBundleTaskIds}
        onOpenBundleTask={(taskId) => setDrawerTaskId(taskId)}
      />

      {/* Drawer overlay for non-primary tasks */}
      <Drawer open={drawerOpen} onClose={handleCloseDrawer}>
        {/* Drawer Task Info Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <TaskInfoHeader task={viewedTask} relation={isViewedTaskInBundle ? 'bundle' : 'selection'} />
          </div>
          <button
            type="button"
            onClick={handleCloseDrawer}
            className="mr-3 mt-3 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            aria-label="Close drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drawer Task Tabs */}
        {drawerOpen && (
          <TaskTabs
            task={viewedTask}
            isPrimaryTask={false}
            isInBundle={isViewedTaskInBundle}
            canAddToBundle={!!isNonBundleSelection && !bundleEditsDisabled}
            canRemoveFromBundle={!!canRemoveFromBundle}
            onAddToBundle={handleAddToBundle}
            onRemoveFromBundle={handleRemoveFromBundle}
          />
        )}
      </Drawer>
    </div>
  )
}
