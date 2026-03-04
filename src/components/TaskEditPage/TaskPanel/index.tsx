import { Tabs } from '@radix-ui/react-tabs'
import { Link } from '@tanstack/react-router'
import { Eye, EyeOff, Star, X, ZoomIn } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { api } from '@/api'
import { isTaskEligibleForBundle } from '@/components/shared/TaskMarkers/utils'
import { STATUS_COLORS, STATUS_LABELS, TaskTabsList } from '@/components/shared/taskConstants'
import { Drawer } from '@/components/ui/Drawer'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { TabsContent } from '@/components/ui/Tabs'
import { useAuthContext } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import type { Task, TaskMarker } from '@/types/Task'
import { useChallengeContext } from '../contexts/ChallengeContext'
import { useTaskBundleContext } from '../contexts/TaskBundleContext'
import { EDITABLE_STATUSES, useTaskContext } from '../contexts/TaskContext'
import { useTaskMapContext } from '../contexts/TaskMapContext'
import { SkipButton, TaskActions } from '../TaskActions'
import { EditorButton, LockButton } from '../TaskActions/EditorButton'
import { CommentsHistoryTab } from './CommentsHistoryTab'
import { getOsmServerUrl, OSMHistoryTab, parseOsmFeatureFromTask } from './OSMHistoryTab'
import {
  calculateGeometryBounds,
  LocationTab,
  PropertiesTab,
  parseTaskLocation,
  TaskTab,
} from './TaskInfoTab'

type TaskRelation = 'primary' | 'bundle' | 'selection'

const HEADER_GRADIENTS: Record<TaskRelation, string> = {
  primary:
    'bg-gradient-to-r from-amber-200 via-amber-100/50 to-white dark:from-amber-800/50 dark:via-amber-900/25 dark:to-slate-800',
  bundle:
    'bg-gradient-to-r from-green-200 via-green-100/50 to-white dark:from-green-800/50 dark:via-green-900/25 dark:to-slate-800',
  selection:
    'bg-gradient-to-r from-purple-200 via-purple-100/50 to-white dark:from-purple-800/50 dark:via-purple-900/25 dark:to-slate-800',
}

const TaskInfoHeader = ({
  task,
  relation,
  showActions = true,
  isLocked = false,
  onClose,
}: {
  task: Task
  relation: TaskRelation
  showActions?: boolean
  isLocked?: boolean
  onClose?: () => void
}) => {
  const { challenge } = useChallengeContext()
  const { isAuthenticated } = useAuthContext()
  const { map, markersHidden, setMarkersHidden } = useTaskMapContext()
  const { data: project } = api.project.getProject(challenge?.parent)

  const status = task.status ?? 0
  const statusLabel = STATUS_LABELS[status] || 'Unknown'
  const statusColor = STATUS_COLORS[status] || 'bg-zinc-500'

  // Only show edit actions if user is authenticated, has locked the task, and status is editable
  const canEdit = isAuthenticated && isLocked && EDITABLE_STATUSES.includes(status)

  const location = parseTaskLocation(task)

  const osmFeature = parseOsmFeatureFromTask(task)
  const osmServer = getOsmServerUrl()
  const osmUrl =
    task.name && osmFeature
      ? `${osmServer}/${osmFeature.type}/${osmFeature.id}`
      : task.name && /^(node|way|relation)\/\d+$/.test(String(task.name))
        ? `${osmServer}/${task.name}`
        : task.name && /^\d+$/.test(String(task.name))
          ? `${osmServer}/way/${task.name}`
          : null

  const handleZoomToTask = () => {
    if (!map?.current) return

    const bounds = calculateGeometryBounds(task)
    if (bounds) {
      map.current.fitBounds(bounds, {
        padding: 50,
        duration: 1000,
        maxZoom: 18,
      })
    } else if (location) {
      map.current.flyTo({
        center: [location.lng, location.lat],
        zoom: 16,
        duration: 1000,
      })
    }
  }

  return (
    <div
      className={cn(
        'shrink-0 space-y-2 rounded-t-2xl border-slate-200 border-b bg-white px-4 pt-3 pb-3 dark:border-slate-700/50 dark:bg-slate-800',
        HEADER_GRADIENTS[relation]
      )}
    >
      {/* Task ID + Status + Primary badge + Map controls + Lock */}
      <div className="flex items-center gap-2">
        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Task #{task.id}</span>
        <div
          className={cn(
            'flex items-center gap-1 rounded-full px-2 py-0.5 font-medium text-[10px] text-white',
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
        <div className="ml-auto flex items-center gap-1">
          {/* Hide/Show markers button */}
          <button
            type="button"
            onClick={() => setMarkersHidden(!markersHidden)}
            className={cn(
              'rounded-md p-1 transition-colors',
              markersHidden
                ? 'text-amber-600 hover:bg-amber-100/50 dark:text-amber-400 dark:hover:bg-amber-900/30'
                : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-slate-700 dark:hover:text-slate-300'
            )}
            title={markersHidden ? 'Show task geometry' : 'Hide task geometry'}
          >
            {markersHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
          {/* Zoom to task button */}
          {(task.geometries || location) && (
            <button
              type="button"
              onClick={handleZoomToTask}
              className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
              title="Zoom to task"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          )}
          {EDITABLE_STATUSES.includes(status) && <LockButton />}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
              aria-label="Close drawer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Task name */}
      {task.name && task.name !== String(task.id) && (
        <p className="break-all font-mono text-xs text-zinc-500 dark:text-zinc-400">{task.name}</p>
      )}

      {/* OSM ID (from task name which is often the OSM ID) */}
      {task.name && (
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          <span className="text-zinc-400 dark:text-zinc-500">OSM ID: </span>
          {osmUrl ? (
            <a
              href={osmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
            >
              {task.name}
            </a>
          ) : (
            task.name
          )}
        </div>
      )}

      {/* Challenge name */}
      {challenge && (
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          <span className="text-zinc-400 dark:text-zinc-500">Challenge: </span>
          <Link
            to="/challenge/$challengeId"
            params={{ challengeId: String(challenge.id) }}
            className="text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
          >
            {challenge.name}
          </Link>
        </div>
      )}

      {/* Project name */}
      {project && (
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          <span className="text-zinc-400 dark:text-zinc-500">Project: </span>
          <Link
            to="/project/$projectId"
            params={{ projectId: String(project.id) }}
            className="text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
          >
            {project.displayName ?? project.name}
          </Link>
        </div>
      )}

      {/* Skip + Editor buttons (only when user can edit) */}
      {showActions && canEdit && (
        <div className="flex items-center justify-end gap-2">
          <SkipButton task={task} />
          <EditorButton task={task} />
        </div>
      )}
    </div>
  )
}

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
      <TaskTabsList commentsCount={commentsCount} osmHistoryCount={osmHistoryCount} />

      <ScrollArea className="min-h-0 flex-1">
        <div className="p-4 pb-44">
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
  const { task: primaryTask, isLocked } = useTaskContext()
  const { user } = useAuthContext()
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
  const targetTaskId = isNonBundleSelection ? selectedMarker.id : (drawerTaskId ?? primaryTask.id)
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

  // Fetch bundle data for the viewed task in the drawer (if it has a bundleId)
  const { data: viewedTaskBundle } = api.taskBundle.getTaskBundle(viewedTask.bundleId ?? 0)
  const viewedTaskBundleTaskIds =
    viewedTaskBundle?.taskIds.filter((id) => id !== viewedTaskId) ?? []

  // When the bundle changes, close drawer if task is no longer in bundle
  useEffect(() => {
    if (drawerTaskId !== null && !bundleTaskIds.includes(drawerTaskId)) {
      setDrawerTaskId(null)
    }
  }, [bundleTaskIds, drawerTaskId])

  // When a bundle task is clicked on the map, open it in the drawer
  useEffect(() => {
    if (
      selectedMarker &&
      bundleTaskIds.includes(selectedMarker.id) &&
      selectedMarker.id !== primaryTask.id
    ) {
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

  // Check if the selected marker is eligible for bundling
  const isSelectedMarkerEligible =
    selectedMarker &&
    isTaskEligibleForBundle(
      {
        status: selectedMarker.status,
        bundleId: selectedMarker.bundleId ?? null,
        lockedBy: selectedMarker.lockedBy ?? null,
      },
      primaryTask.bundleId ?? null,
      user?.id ?? null
    )

  // Non-primary bundle task IDs for listing
  const nonPrimaryBundleTaskIds = bundleTaskIds.filter((id) => id !== primaryTask.id)

  return (
    <div className="relative flex w-full flex-col overflow-hidden md:h-full">
      {/* Primary Task Info Header */}
      <TaskInfoHeader task={primaryTask} relation="primary" isLocked={isLocked} />

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

      {/* Task Actions Footer - floats over content, under drawer */}
      <div className="absolute right-0 bottom-0 left-0 z-10 rounded-b-2xl border-slate-200/80 border-t bg-white px-3 pt-3 pb-3 dark:border-slate-700/50 dark:bg-slate-800">
        <TaskActions />
      </div>

      {/* Drawer overlay for non-primary tasks */}
      <Drawer open={drawerOpen} onClose={handleCloseDrawer}>
        {/* Drawer Task Info Header */}
        <TaskInfoHeader
          task={viewedTask}
          relation={isViewedTaskInBundle ? 'bundle' : 'selection'}
          showActions={false}
          onClose={handleCloseDrawer}
        />

        {/* Drawer Task Tabs */}
        {drawerOpen && (
          <TaskTabs
            task={viewedTask}
            isPrimaryTask={false}
            isInBundle={isViewedTaskInBundle}
            canAddToBundle={
              !!isNonBundleSelection && !bundleEditsDisabled && !!isSelectedMarkerEligible
            }
            canRemoveFromBundle={!!canRemoveFromBundle}
            onAddToBundle={handleAddToBundle}
            onRemoveFromBundle={handleRemoveFromBundle}
            nonPrimaryBundleTaskIds={viewedTaskBundleTaskIds}
          />
        )}
      </Drawer>
    </div>
  )
}
