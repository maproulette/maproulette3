import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightIcon,
  MessageSquare,
  Package,
  PackageMinus,
  PackagePlus,
  RotateCcw,
  Send,
  Trash2,
} from 'lucide-react'
import type maplibregl from 'maplibre-gl'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '@/api'
import { Button } from '@/components/ui/Button'
import { useTaskBundleContext } from '@/contexts/tasks/TaskBundleContext'
import { useTaskMapContext } from '@/contexts/tasks/TaskMapContext'
import { cn } from '@/lib/utils'
import type { Comment as TaskComment } from '@/types/Comment'
import type { Task } from '@/types/Task'

interface TasksTablePanelProps {
  map: React.RefObject<maplibregl.Map | null>
  mapLoaded: boolean
  currentTaskId?: number
  challengeId?: number
  taskReadOnly?: boolean
  workspaceName?: string
  currentUser?: { id: number; isSuperUser?: boolean }
  currentTask?: Task
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

const STATUS_COLORS: Record<number, string> = {
  0: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  1: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  2: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  3: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  4: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  5: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  6: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  7: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  8: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  9: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300',
}

const PRIORITY_LABELS: Record<number, string> = {
  0: 'High',
  1: 'Medium',
  2: 'Low',
}

export const TasksTablePanel = ({
  map,
  mapLoaded,
  currentTaskId,
  challengeId,
  taskReadOnly = false,
  workspaceName = 'taskCompletion',
  currentUser,
  currentTask,
}: TasksTablePanelProps) => {
  const [boundsString, setBoundsString] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(50)
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<number>>(new Set())
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null)
  const [commentText, setCommentText] = useState('')
  const [isBundling, setIsBundling] = useState(false)
  const [isUnbundling, setIsUnbundling] = useState(false)
  const queryClient = useQueryClient()
  const { setHoveredTaskId, setSelectedTaskIds: setMapSelectedTaskIds } = useTaskMapContext()
  const {
    setActiveBundle,
    activeBundle,
    initialBundle,
    setInitialBundle,
    bundleEditsDisabled,
    setBundleEditsDisabled,
    bundlingDisabledReason,
    setBundlingDisabledReason,
    showBundleOnly,
    setShowBundleOnly,
    setVisibleTaskIds,
    clearBundle,
    resetBundle,
  } = useTaskBundleContext()

  const tableContainerRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  const previousTaskIdRef = useRef(currentTaskId)

  useEffect(() => {
    const container = tableContainerRef.current

    if (container) {
      const handleScroll = () => {
        setScrollPosition(container.scrollTop)
      }

      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    const container = tableContainerRef.current

    if (container && previousTaskIdRef.current !== currentTaskId) {
      container.scrollTop = scrollPosition
      previousTaskIdRef.current = currentTaskId
    }
  }, [currentTaskId, scrollPosition])

  const updateBounds = useCallback(() => {
    if (!map.current || !mapLoaded) return

    const bounds = map.current.getBounds()

    const boundsStr = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`
    setBoundsString(boundsStr)
  }, [map, mapLoaded])

  useEffect(() => {
    if (!map.current || !mapLoaded) return

    updateBounds()

    const handleMoveEnd = () => {
      updateBounds()
    }

    map.current.on('moveend', handleMoveEnd)
    map.current.on('zoomend', handleMoveEnd)

    return () => {
      if (map.current) {
        map.current.off('moveend', handleMoveEnd)
        map.current.off('zoomend', handleMoveEnd)
      }
    }
  }, [map, mapLoaded, updateBounds])

  const { data: tasksResponse, isLoading } = useQuery({
    ...api.task.getTasksInBounds({
      bounds: boundsString,
      challengeIds: challengeId ? String(challengeId) : undefined,
      limit: pageSize,
      page: currentPage,
    }),
    enabled: !!boundsString && mapLoaded && !showBundleOnly,
  })

  const { data: bundleData, isLoading: isBundleLoading } = useQuery({
    ...api.taskBundle.getTaskBundle(activeBundle?.bundleId || 0, false),
    enabled: showBundleOnly && !!activeBundle?.bundleId,
  })

  const displayedTasks = useMemo(() => {
    if (showBundleOnly && bundleData?.tasks) {
      return (bundleData.tasks as Task[]) || []
    }
    return tasksResponse?.data || []
  }, [showBundleOnly, bundleData, tasksResponse?.data])

  const taskCount =
    showBundleOnly && bundleData
      ? (bundleData.tasks as Task[])?.length || bundleData.taskIds.length
      : (tasksResponse?.total ?? 0)

  const currentLoading = showBundleOnly ? isBundleLoading : isLoading
  const totalPages = Math.ceil(taskCount / pageSize)
  const startIndex = currentPage * pageSize + 1
  const endIndex = Math.min((currentPage + 1) * pageSize, taskCount)

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(0)
  }

  const handleSelectTask = (taskId: number) => {
    setSelectedTaskIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedTaskIds.size === displayedTasks.length) {
      setSelectedTaskIds(new Set())
    } else {
      setSelectedTaskIds(new Set(displayedTasks.map((task: Task) => task.id)))
    }
  }

  useEffect(() => {
    if (showBundleOnly && activeBundle) {
      setVisibleTaskIds(activeBundle.taskIds)
      setMapSelectedTaskIds(activeBundle.taskIds)
    } else {
      setVisibleTaskIds(null)
      setMapSelectedTaskIds(Array.from(selectedTaskIds))
    }
  }, [showBundleOnly, activeBundle, selectedTaskIds, setMapSelectedTaskIds, setVisibleTaskIds])

  useEffect(() => {
    if (currentTaskId) {
      setSelectedTaskIds((prev) => {
        if (prev.has(currentTaskId)) return prev
        const newSet = new Set(prev)
        newSet.add(currentTaskId)
        return newSet
      })
    }
  }, [currentTaskId])

  useEffect(() => {
    if (activeBundle && displayedTasks.length > 0) {
      const bundleTasksInView = displayedTasks
        .filter((task) => activeBundle.taskIds.includes(task.id))
        .map((task) => task.id)

      if (bundleTasksInView.length > 0) {
        setSelectedTaskIds((prev) => {
          const newSet = new Set(bundleTasksInView)
          if (prev.size === newSet.size && Array.from(prev).every((id) => newSet.has(id))) {
            return prev
          }
          return newSet
        })
      }
    }
  }, [activeBundle, displayedTasks])

  useEffect(() => {
    setCurrentPage(0)
  }, [showBundleOnly])

  useEffect(() => {
    const fetchBundle = async () => {
      if (currentTask?.bundleId && !activeBundle) {
        try {
          const bundleData = await queryClient.fetchQuery(
            api.taskBundle.getTaskBundle(currentTask.bundleId, false)
          )
          if (bundleData) {
            const newBundle = {
              bundleId: bundleData.bundleId,
              taskIds: bundleData.taskIds,
              tasks: bundleData.tasks,
              name: `Bundle #${bundleData.bundleId}`,
            }
            setActiveBundle(newBundle)
            setInitialBundle(newBundle)
          }
        } catch (error) {
          console.error('Error fetching bundle:', error)
        }
      }
    }

    fetchBundle()
  }, [currentTask?.bundleId, activeBundle, queryClient, setActiveBundle, setInitialBundle])

  useEffect(() => {
    const task = currentTask
    const user = currentUser

    if (!task || !user) {
      setBundleEditsDisabled(false)
      setBundlingDisabledReason(null)
      return
    }

    const isCompletionWorkspace = ['taskCompletion'].includes(workspaceName)

    let reason: string | null = null
    let disabled = false

    if (!isCompletionWorkspace) {
      reason = 'workspace'
      disabled = true
    } else if (taskReadOnly) {
      reason = 'readOnly'
      disabled = true
    } else if (task.cooperativeWork) {
      reason = 'taskType'
      disabled = true
    } else {
      const isReviewCompleted = task.review?.reviewStatus === 2
      const isTaskCompleted = [0, 3, 6].includes(task.status ?? -1)
      const completionStatus = isReviewCompleted || isTaskCompleted

      const hasNoCompletion = !task.completedBy
      const isTaskCompleter = user.id === task.completedBy
      const enableMapperEdits = hasNoCompletion || isTaskCompleter || user.isSuperUser

      if (!(enableMapperEdits && completionStatus)) {
        reason = 'mapperEdits'
        disabled = true
      }
    }

    setBundleEditsDisabled(disabled)
    setBundlingDisabledReason(reason)
  }, [
    currentTask,
    currentUser,
    workspaceName,
    taskReadOnly,
    setBundleEditsDisabled,
    setBundlingDisabledReason,
  ])

  const { data: expandedTaskData } = useQuery({
    ...api.task.getTask(expandedTaskId || 0),
    enabled: !!expandedTaskId,
  })

  const { data: taskComments, isLoading: isLoadingComments } = useQuery({
    ...api.task.getTaskComments(expandedTaskId || 0),
    enabled: !!expandedTaskId,
  })

  const comments = (taskComments as unknown as TaskComment[]) || []

  const addCommentMutation = useMutation({
    mutationFn: ({ taskId, commentText }: { taskId: number; commentText: string }) =>
      api.task.addTaskComment(taskId, commentText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskComments', expandedTaskId] })
      setCommentText('')
    },
  })

  const handleAddComment = () => {
    if (expandedTaskId && commentText.trim()) {
      addCommentMutation.mutate({ taskId: expandedTaskId, commentText: commentText })
    }
  }

  const handleToggleExpand = (taskId: number) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId)
  }

  const createBundleMutation = useMutation({
    mutationFn: async (taskIds: number[]) => {
      setIsBundling(true)
      return api.taskBundle.createTaskBundle({
        name: `Bundle ${Date.now()}`,
        taskIds,
        primaryId: currentTaskId || taskIds[0],
      })
    },
    onSuccess: (bundle) => {
      const newBundle = {
        bundleId: bundle.bundleId,
        taskIds: bundle.taskIds,
        tasks: bundle.tasks,
        name: `Bundle #${bundle.bundleId}`,
      }
      setActiveBundle(newBundle)
      setInitialBundle(newBundle)
      queryClient.invalidateQueries({ queryKey: ['tasksInBounds'] })
      queryClient.invalidateQueries({ queryKey: ['taskBundle', bundle.bundleId] })
    },
    onSettled: () => {
      setIsBundling(false)
    },
  })

  const handleAddTaskToBundle = (taskId: number) => {
    if (!activeBundle || isBundling || bundleEditsDisabled) return

    setIsBundling(true)
    try {
      const taskToAdd = displayedTasks.find((task) => task.id === taskId)
      if (!taskToAdd) {
        console.error('Task not found in displayed tasks')
        return
      }

      const updatedTasks = [...(activeBundle.tasks || []), taskToAdd]
      const updatedTaskIds = [...activeBundle.taskIds, taskId]

      setActiveBundle({
        ...activeBundle,
        taskIds: updatedTaskIds,
        tasks: updatedTasks,
      })

      setSelectedTaskIds((prev) => {
        const newSet = new Set(prev)
        newSet.add(taskId)
        return newSet
      })
    } finally {
      setIsBundling(false)
    }
  }

  const handleRemoveTaskFromBundle = (taskId: number) => {
    if (!activeBundle || isUnbundling || bundleEditsDisabled) return

    if (taskId === currentTaskId) {
      alert('Cannot remove the primary task from the bundle')
      return
    }

    setIsUnbundling(true)
    try {
      const updatedTasks = (activeBundle.tasks || []).filter((task) => task.id !== taskId)
      const updatedTaskIds = activeBundle.taskIds.filter((id) => id !== taskId)

      if (updatedTaskIds.length <= 1) {
        setShowBundleOnly(false)
        clearBundle()
        setSelectedTaskIds(currentTaskId ? new Set([currentTaskId]) : new Set())
      } else {
        setActiveBundle({
          ...activeBundle,
          taskIds: updatedTaskIds,
          tasks: updatedTasks,
        })

        setSelectedTaskIds((prev) => {
          const newSet = new Set(prev)
          newSet.delete(taskId)
          return newSet
        })
      }
    } finally {
      setIsUnbundling(false)
    }
  }

  const handleClearBundle = () => {
    if (isUnbundling || bundleEditsDisabled) return

    setIsUnbundling(true)
    try {
      setShowBundleOnly(false)
      clearBundle()
      setSelectedTaskIds(currentTaskId ? new Set([currentTaskId]) : new Set())
    } finally {
      setIsUnbundling(false)
    }
  }

  const handleCreateBundle = () => {
    const taskIds = Array.from(selectedTaskIds)
    if (taskIds.length > 50) {
      alert('Cannot bundle more than 50 tasks at once')
      return
    }
    if (taskIds.length > 1 && !bundleEditsDisabled) {
      if (currentTaskId && !taskIds.includes(currentTaskId)) {
        taskIds.unshift(currentTaskId)
      }
      createBundleMutation.mutate(taskIds)
    }
  }

  const handleResetBundle = () => {
    if (initialBundle && !bundleEditsDisabled && !isUnbundling) {
      resetBundle()
      setSelectedTaskIds(new Set(initialBundle.taskIds))
    }
  }

  const isTooManyTasks = selectedTaskIds.size > 50

  const getBundlingDisabledMessage = () => {
    if (!bundlingDisabledReason) return null

    const messages: Record<string, string> = {
      workspace: 'Task bundling is only available in the Task Completion workspace',
      readOnly: 'Task bundling is disabled in read-only mode',
      locked: 'This task is locked by another user',
      taskType: 'Task bundling is not available for cooperative or tag fix tasks',
      mapperEdits: 'Task bundling requires mapper edit permissions',
      doneOrReview: 'Task must be completed or reviewed to enable bundling',
    }

    return messages[bundlingDisabledReason] || 'Task bundling is currently disabled'
  }

  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-900">
      {/* Bundling Disabled Message */}
      {bundleEditsDisabled && bundlingDisabledReason && (
        <div className="shrink-0 border-zinc-200 border-b bg-blue-50 px-4 py-2 text-center text-blue-800 text-sm dark:border-zinc-800 dark:bg-blue-900/30 dark:text-blue-200">
          {getBundlingDisabledMessage()}
        </div>
      )}

      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-zinc-200 border-b bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-sm">
            {activeBundle ? 'Bundle Tasks' : 'Visible Tasks'}
          </h3>
          <span className="rounded-full bg-zinc-200 px-2 py-0.5 font-medium text-xs dark:bg-zinc-800">
            {currentLoading
              ? 'Loading...'
              : taskCount > 0
                ? `${startIndex}-${endIndex} of ${taskCount}`
                : '0 tasks'}
          </span>
          {activeBundle && (
            <span className="rounded-full bg-purple-100 px-2 py-0.5 font-medium text-purple-700 text-xs dark:bg-purple-900/30 dark:text-purple-300">
              Bundle #{activeBundle.bundleId} ({activeBundle.taskIds.length} tasks)
            </span>
          )}
          {!activeBundle && selectedTaskIds.size > 0 && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 font-medium text-blue-700 text-xs dark:bg-blue-900/30 dark:text-blue-300">
              {selectedTaskIds.size} selected
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Show Bundle Only Toggle */}
          {activeBundle && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2"
              onClick={() => setShowBundleOnly(!showBundleOnly)}
              title={showBundleOnly ? 'Show all tasks' : 'Show only bundled tasks'}
            >
              {showBundleOnly ? 'Show All Tasks' : 'Show Bundle Only'}
            </Button>
          )}
          {/* Bundle Management Buttons */}
          {activeBundle && initialBundle && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2"
              onClick={handleResetBundle}
              disabled={bundleEditsDisabled || isUnbundling}
              title="Reset to initial bundle"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          )}
          {activeBundle && (
            <Button
              variant="destructive"
              size="sm"
              className="h-8 gap-2"
              onClick={handleClearBundle}
              disabled={bundleEditsDisabled || isUnbundling}
              title="Delete bundle"
            >
              {isUnbundling ? (
                <>Loading...</>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Unbundle
                </>
              )}
            </Button>
          )}
          {/* Create Bundle Button */}
          {!activeBundle && selectedTaskIds.size > 1 && (
            <Button
              variant="default"
              size="sm"
              className="h-8 gap-2"
              onClick={handleCreateBundle}
              disabled={bundleEditsDisabled || isTooManyTasks || isBundling}
              title={
                isTooManyTasks
                  ? 'Cannot bundle more than 50 tasks'
                  : 'Create bundle from selected tasks'
              }
            >
              {isBundling ? (
                <>Loading...</>
              ) : (
                <>
                  <Package className="h-4 w-4" />
                  {isTooManyTasks ? 'Too Many Tasks' : 'Bundle Tasks'}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div
        ref={tableContainerRef}
        className="min-h-0 flex-1 snap-y snap-mandatory overflow-auto scroll-smooth"
      >
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 border-zinc-200 border-b bg-zinc-100 text-xs text-zinc-700 uppercase dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
            <tr>
              <th className="w-12 px-4 py-3">
                {!activeBundle && (
                  <input
                    type="checkbox"
                    checked={
                      displayedTasks.length > 0 && selectedTaskIds.size === displayedTasks.length
                    }
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-zinc-300 bg-white text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 dark:border-zinc-600 dark:bg-zinc-700"
                  />
                )}
              </th>
              <th className="w-12 px-4 py-3"></th>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Location</th>
              <th className="w-12 px-4 py-3">{activeBundle ? 'Actions' : ''}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {currentLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                  Loading tasks...
                </td>
              </tr>
            ) : displayedTasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                  No tasks in visible area
                </td>
              </tr>
            ) : (
              displayedTasks.flatMap((task: Task) => {
                const isCurrentTask = !!(currentTaskId && task.id === currentTaskId)
                const isSelected = selectedTaskIds.has(task.id)
                const isExpanded = expandedTaskId === task.id
                const isInBundle = activeBundle?.taskIds.includes(task.id) ?? false
                const isPrimaryTask = isCurrentTask

                let lat = 0
                let lng = 0
                if (task.location) {
                  try {
                    const location =
                      typeof task.location === 'string' ? JSON.parse(task.location) : task.location
                    if (location.coordinates) {
                      ;[lng, lat] = location.coordinates
                    }
                  } catch (_e) {}
                }

                const mainRow = (
                  <tr
                    key={task.id}
                    onMouseEnter={() => setHoveredTaskId(task.id)}
                    onMouseLeave={() => setHoveredTaskId(null)}
                    className={cn(
                      'snap-start transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800',
                      isCurrentTask && 'bg-blue-50 dark:bg-blue-900/20',
                      isSelected && 'bg-yellow-50 dark:bg-yellow-900/10',
                      isInBundle && 'bg-purple-50 dark:bg-purple-900/10'
                    )}
                  >
                    <td className="whitespace-nowrap px-4 py-3">
                      {activeBundle ? (
                        <div className="flex items-center">
                          {isInBundle && (
                            <span className="inline-block h-2 w-2 rounded-full bg-purple-500" />
                          )}
                        </div>
                      ) : (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation()
                            handleSelectTask(task.id)
                          }}
                          className="h-4 w-4 rounded border-zinc-300 bg-white text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 dark:border-zinc-600 dark:bg-zinc-700"
                        />
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <button
                        onClick={() => handleToggleExpand(task.id)}
                        className="text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                        type="button"
                      >
                        <ChevronRightIcon
                          className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-90')}
                        />
                      </button>
                    </td>
                    <td className="cursor-pointer whitespace-nowrap px-4 py-3 font-medium">
                      {isCurrentTask && (
                        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-blue-500" />
                      )}
                      {task.id}
                    </td>
                    <td className="cursor-pointer whitespace-nowrap px-4 py-3">
                      <span
                        className={cn(
                          'rounded-full px-2 py-1 font-medium text-xs',
                          STATUS_COLORS[task.status ?? 0] || STATUS_COLORS[0]
                        )}
                      >
                        {STATUS_LABELS[task.status ?? 0] || 'Unknown'}
                      </span>
                    </td>
                    <td className="cursor-pointer whitespace-nowrap px-4 py-3">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        {PRIORITY_LABELS[task.priority ?? 0] || `Priority ${task.priority ?? 0}`}
                      </span>
                    </td>
                    <td className="cursor-pointer whitespace-nowrap px-4 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                      {lat.toFixed(4)}, {lng.toFixed(4)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {activeBundle ? (
                        <div className="flex items-center gap-1">
                          {isInBundle ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 px-2"
                              onClick={() => handleRemoveTaskFromBundle(task.id)}
                              disabled={bundleEditsDisabled || isUnbundling || isPrimaryTask}
                              title={
                                isPrimaryTask ? 'Cannot remove primary task' : 'Remove from bundle'
                              }
                            >
                              <PackageMinus className="h-3.5 w-3.5" />
                              {isPrimaryTask ? 'Primary' : 'Remove'}
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 px-2"
                              onClick={() => handleAddTaskToBundle(task.id)}
                              disabled={bundleEditsDisabled || isBundling}
                              title="Add to bundle"
                            >
                              <PackagePlus className="h-3.5 w-3.5" />
                              Add
                            </Button>
                          )}
                        </div>
                      ) : (
                        comments &&
                        expandedTaskId === task.id && (
                          <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                            <MessageSquare className="h-4 w-4" />
                            <span className="text-xs">{comments.length}</span>
                          </div>
                        )
                      )}
                    </td>
                  </tr>
                )

                const expandedRow = isExpanded ? (
                  <tr key={`${task.id}-expanded`}>
                    <td colSpan={7} className="bg-zinc-50 px-4 py-4 dark:bg-zinc-900/50">
                      <div className="space-y-4">
                        {/* Task Data */}
                        <div className="space-y-2">
                          <h4 className="flex items-center gap-2 font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                            Task Data
                          </h4>
                          {expandedTaskData ? (
                            <pre className="max-h-64 overflow-auto rounded border border-zinc-300 bg-white p-3 font-mono text-xs text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                              {JSON.stringify(expandedTaskData, null, 2)}
                            </pre>
                          ) : (
                            <div className="text-sm text-zinc-500">Loading task data...</div>
                          )}
                        </div>

                        {/* Comments */}
                        <div className="space-y-2">
                          <h4 className="flex items-center gap-2 font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                            <MessageSquare className="h-4 w-4" />
                            Comments
                          </h4>

                          {/* Comments List */}
                          <div className="max-h-48 space-y-2 overflow-auto">
                            {isLoadingComments ? (
                              <div className="text-sm text-zinc-500">Loading comments...</div>
                            ) : comments && comments.length > 0 ? (
                              comments.map((comment) => (
                                <div
                                  key={comment.id}
                                  className="rounded border border-zinc-300 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800"
                                >
                                  <div className="mb-1 flex items-center justify-between">
                                    <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                                      {comment.osm_username || 'Unknown User'}
                                    </span>
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                      {comment.created
                                        ? new Date(comment.created).toLocaleString()
                                        : ''}
                                    </span>
                                  </div>
                                  <p className="text-sm text-zinc-700 dark:text-zinc-300">
                                    {comment.comment}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <div className="text-sm text-zinc-500">No comments yet</div>
                            )}
                          </div>

                          {/* Add Comment */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleAddComment()
                                }
                              }}
                              placeholder="Add a comment..."
                              className="flex-1 rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400"
                            />
                            <Button
                              onClick={handleAddComment}
                              disabled={!commentText.trim() || addCommentMutation.isPending}
                              size="icon"
                              className="h-10 w-10"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : null

                return [mainRow, expandedRow].filter(Boolean)
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex shrink-0 items-center justify-between border-zinc-200 border-t bg-zinc-50 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-600 dark:text-zinc-400">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <span className="text-xs text-zinc-600 dark:text-zinc-400">
            Page {totalPages > 0 ? currentPage + 1 : 0} of {totalPages}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handlePreviousPage}
            disabled={currentPage === 0 || currentLoading}
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages - 1 || currentLoading}
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
