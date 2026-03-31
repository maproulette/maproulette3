import { useEffect, useRef, useState } from 'react'
import { api } from '@/api'
import { TaskTab, TaskTabs } from '@/components/shared/TaskInfoPanel'
import { isTaskEligibleForBundle } from '@/components/shared/TaskMarkers/utils'
import { useTaskBundleContext } from '@/components/TaskEditPage/TaskBundleContext'
import { useTaskContext } from '@/components/TaskEditPage/TaskContext'
import { useTaskMapContext } from '@/components/TaskEditPage/TaskMapContext'
import { Drawer } from '@/components/ui/Drawer'
import { useAuthContext } from '@/contexts/AuthContext'
import type { Task, TaskMarker } from '@/types/Task'
import { TaskActions } from './TaskActions'
import { TaskInfoHeader } from './TaskInfoHeader'

export const TaskPanel = () => {
  const { task, isLocked } = useTaskContext()
  const { user } = useAuthContext()
  const { activeBundle, setActiveBundle, setInitialBundle, bundleEditsDisabled } =
    useTaskBundleContext()
  const { selectedMarker, setSelectedMarker, setActiveTaskId, emptyClickCount } =
    useTaskMapContext()
  const [drawerTaskId, setDrawerTaskId] = useState<number | null>(null)
  // 'closed' | 'open' | 'sliding-out' (animating out before switching task)
  const [drawerState, setDrawerState] = useState<'closed' | 'open' | 'sliding-out'>('closed')

  const bundleTaskIds = activeBundle?.taskIds ?? [task.id]
  const isNonBundleSelection = selectedMarker && !bundleTaskIds.includes(selectedMarker.id)

  // The logical task the drawer should show
  const targetTaskId = isNonBundleSelection ? selectedMarker.id : (drawerTaskId ?? task.id)
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
  const { data: fetchedTask } = api.task.getTask(viewedTaskId !== task.id ? viewedTaskId : 0)
  const viewedTask: Task = viewedTaskId === task.id ? task : (fetchedTask ?? task)

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
      selectedMarker.id !== task.id
    ) {
      setDrawerTaskId(selectedMarker.id)
      setSelectedMarker(null)
    }
  }, [selectedMarker, bundleTaskIds, setSelectedMarker, task.id])

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
        taskIds: [task.id, selectedMarker.id],
        tasks: [task],
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
    if (viewedTaskId === task.id) return

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

  // Check if the selected marker is eligible for bundling
  const isSelectedMarkerEligible =
    selectedMarker &&
    isTaskEligibleForBundle(
      {
        status: selectedMarker.status,
        bundleId: selectedMarker.bundleId ?? null,
        lockedBy: selectedMarker.lockedBy ?? null,
      },
      task.bundleId ?? null,
      user?.id ?? null
    )

  return (
    <div className="relative flex w-full flex-col overflow-hidden md:h-full">
      {/* Primary Task Info Header */}
      <TaskInfoHeader task={task} relation="primary" isLocked={isLocked} />

      {/* Primary Task Tabs */}
      <TaskTabs
        task={task}
        showLocationTab
        contentClassName="p-4 pb-44"
        taskTabContent={
          <TaskTab task={task} onOpenBundleTask={(taskId: number) => setDrawerTaskId(taskId)} />
        }
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
            showLocationTab
            contentClassName="p-4 pb-44"
            taskTabContent={
              <TaskTab
                task={viewedTask}
                canAddToBundle={
                  !!isNonBundleSelection && !bundleEditsDisabled && !!isSelectedMarkerEligible
                }
                onAddToBundle={handleAddToBundle}
                onRemoveFromBundle={handleRemoveFromBundle}
                nonPrimaryBundleTaskIds={viewedTaskBundleTaskIds}
              />
            }
          />
        )}
      </Drawer>
    </div>
  )
}
