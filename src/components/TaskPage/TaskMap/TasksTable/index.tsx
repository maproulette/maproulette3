import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type maplibregl from 'maplibre-gl'
import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '@/api'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/Table'
import { useMapContext } from '@/contexts/MapContext'
import { useTaskBundleContext } from '@/contexts/tasks/TaskBundleContext'
import { cn } from '@/lib/utils'
import type { Comment as TaskComment } from '@/types/Comment'
import type { Task } from '@/types/Task'
import { ResizeHandle } from './ResizeHandle'
import { TableHeader } from './TableHeader'
import { TablePagination } from './TablePagination'
import { TaskExpandedRow } from './TaskExpandedRow'
import { TaskTableHeader } from './TaskTableHeader'
import { TaskTableRow } from './TaskTableRow'

interface TasksTableProps {
  map: React.RefObject<maplibregl.Map | null>
  mapLoaded: boolean
  currentTaskId?: number
  challengeId?: number
}

export const TasksTable = ({ map, mapLoaded, currentTaskId, challengeId }: TasksTableProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [height, setHeight] = useState(300)
  const [isDragging, setIsDragging] = useState(false)
  const [boundsString, setBoundsString] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(50)
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<number>>(new Set())
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null)
  const tableRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()
  const { setHoveredTaskId, setSelectedTaskIds: setMapSelectedTaskIds } = useMapContext()
  const { setActiveBundle, showBundleOnly, activeBundle } = useTaskBundleContext()

  // Update bounds when map moves
  const updateBounds = useCallback(() => {
    if (!map.current || !mapLoaded) return

    const bounds = map.current.getBounds()
    const boundsStr = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`
    setBoundsString(boundsStr)
  }, [map, mapLoaded])

  // Set up map event listeners
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

  // Reset page to 1 when bounds change (map moves)
  useEffect(() => {
    if (boundsString) {
      setCurrentPage(0)
    }
  }, [boundsString])

  // Fetch tasks based on visible bounds
  const { data: tasksResponse, isLoading } = useQuery({
    ...api.task.getTasksInBounds({
      bounds: boundsString,
      challengeIds: challengeId ? String(challengeId) : undefined,
      limit: pageSize,
      page: currentPage,
    }),
    enabled: !!boundsString && mapLoaded,
  })

  // Handle resize dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !tableRef.current) return

      const container = tableRef.current.parentElement
      if (!container) return

      const containerRect = container.getBoundingClientRect()
      const newHeight = containerRect.bottom - e.clientY

      const minHeight = 100
      const maxHeight = containerRect.height * 0.8
      setHeight(Math.max(minHeight, Math.min(newHeight, maxHeight)))
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  // Filter tasks locally when bundle mode is active
  const allTasks = tasksResponse?.data || []
  const displayedTasks =
    showBundleOnly && activeBundle
      ? allTasks.filter((task) => activeBundle.taskIds.includes(task.id))
      : allTasks

  const taskCount = displayedTasks.length
  const totalPages = Math.ceil(taskCount / pageSize)
  const startIndex = currentPage * pageSize + 1
  const endIndex = Math.min((currentPage + 1) * pageSize, taskCount)

  // Pagination handlers
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

  // Selection handlers
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

  // Sync selected tasks with map context
  useEffect(() => {
    setMapSelectedTaskIds(Array.from(selectedTaskIds))
  }, [selectedTaskIds, setMapSelectedTaskIds])

  // Auto-select all tasks in the active bundle
  useEffect(() => {
    if (activeBundle && displayedTasks.length > 0) {
      const bundleTasksInView = displayedTasks
        .filter((task) => activeBundle.taskIds.includes(task.id))
        .map((task) => task.id)

      if (bundleTasksInView.length > 0) {
        setSelectedTaskIds(new Set(bundleTasksInView))
      }
    }
  }, [activeBundle, displayedTasks])

  // Fetch task details when expanded
  const { data: expandedTaskData, isLoading: isLoadingTaskData } = useQuery({
    ...api.task.getTask(expandedTaskId || 0),
    enabled: !!expandedTaskId,
  })

  // Fetch comments for expanded task
  const { data: taskComments, isLoading: isLoadingComments } = useQuery({
    ...api.task.getTaskComments(expandedTaskId || 0),
    enabled: !!expandedTaskId,
  })

  const comments = (taskComments as unknown as TaskComment[]) || []

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: ({ taskId, commentText }: { taskId: number; commentText: string }) =>
      api.task.addTaskComment(taskId, commentText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskComments', expandedTaskId] })
    },
  })

  const handleAddComment = (text: string) => {
    if (expandedTaskId && text.trim()) {
      addCommentMutation.mutate({ taskId: expandedTaskId, commentText: text })
    }
  }

  const handleToggleExpand = (taskId: number) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId)
  }

  const handleToggleMaximize = () => {
    if (isMaximized) {
      setIsMaximized(false)
    } else {
      setIsMaximized(true)
      setIsExpanded(true)
    }
  }

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded)
    if (!isExpanded) {
      setIsMaximized(false)
    }
  }

  // Create bundle mutation
  const createBundleMutation = useMutation({
    mutationFn: (taskIds: number[]) =>
      api.taskBundle.createTaskBundle({
        name: `Bundle ${Date.now()}`,
        taskIds,
        primaryId: taskIds[0],
      }),
    onSuccess: (bundle) => {
      setActiveBundle({
        bundleId: bundle.bundleId,
        taskIds: bundle.taskIds,
        name: `Bundle #${bundle.bundleId}`,
      })
      setSelectedTaskIds(new Set())
    },
  })

  const handleCreateBundle = () => {
    const taskIds = Array.from(selectedTaskIds)
    if (taskIds.length > 1) {
      createBundleMutation.mutate(taskIds)
    }
  }

  // Determine height based on state
  const containerHeight = isMaximized ? '80vh' : isExpanded ? `${height}px` : '48px'

  return (
    <div
      ref={tableRef}
      className={cn(
        'absolute right-0 bottom-0 left-0 z-20 flex flex-col border-zinc-700 border-t bg-white shadow-2xl transition-all duration-300 dark:bg-zinc-900',
        isDragging && 'select-none'
      )}
      style={{ height: containerHeight }}
    >
      {/* Resize Handle */}
      {isExpanded && !isMaximized && (
        <ResizeHandle onMouseDown={handleMouseDown} isDragging={isDragging} />
      )}

      {/* Header */}
      <TableHeader
        isExpanded={isExpanded}
        isMaximized={isMaximized}
        isLoading={isLoading}
        taskCount={taskCount}
        startIndex={startIndex}
        endIndex={endIndex}
        selectedCount={selectedTaskIds.size}
        onToggleExpand={handleToggleExpanded}
        onToggleMaximize={handleToggleMaximize}
        onCreateBundle={handleCreateBundle}
      />

      {/* Table Content */}
      {isExpanded && (
        <div className="flex-1 overflow-auto">
          <Table className="w-full text-left text-sm">
            <TaskTableHeader
              allSelected={selectedTaskIds.size === displayedTasks.length}
              onSelectAll={handleSelectAll}
              hasDisplayedTasks={displayedTasks.length > 0}
            />
            <TableBody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                    Loading tasks...
                  </TableCell>
                </TableRow>
              ) : displayedTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                    No tasks in visible area
                  </TableCell>
                </TableRow>
              ) : (
                displayedTasks.flatMap((task: Task) => {
                  const isCurrentTask = currentTaskId && task.id === currentTaskId
                  const isSelected = selectedTaskIds.has(task.id)
                  const isExpanded = expandedTaskId === task.id

                  const mainRow = (
                    <TaskTableRow
                      key={task.id}
                      task={task}
                      isCurrentTask={!!isCurrentTask}
                      isSelected={isSelected}
                      isExpanded={isExpanded}
                      comments={isExpanded ? comments : undefined}
                      onSelectTask={handleSelectTask}
                      onToggleExpand={handleToggleExpand}
                      onMouseEnter={() => setHoveredTaskId(task.id)}
                      onMouseLeave={() => setHoveredTaskId(null)}
                    />
                  )

                  const expandedRow = isExpanded ? (
                    <TaskExpandedRow
                      key={`${task.id}-expanded`}
                      taskData={expandedTaskData}
                      isLoadingTaskData={isLoadingTaskData}
                      comments={comments}
                      isLoadingComments={isLoadingComments}
                      onAddComment={handleAddComment}
                      isAddingComment={addCommentMutation.isPending}
                    />
                  ) : null

                  return [mainRow, expandedRow].filter(Boolean)
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination Footer */}
      {isExpanded && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          isLoading={isLoading}
          onPageSizeChange={handlePageSizeChange}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
        />
      )}
    </div>
  )
}
