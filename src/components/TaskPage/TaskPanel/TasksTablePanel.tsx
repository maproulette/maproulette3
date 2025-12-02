import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightIcon,
  MessageSquare,
  Send,
} from 'lucide-react'
import type maplibregl from 'maplibre-gl'
import { useCallback, useEffect, useState } from 'react'
import { api } from '@/api'
import { Button } from '@/components/ui/Button'
import { useMapContext } from '@/contexts/MapContext'
import { cn } from '@/lib/utils'
import type { Comment as TaskComment } from '@/types/Comment'
import type { Task } from '@/types/Task'

interface TasksTablePanelProps {
  map: React.RefObject<maplibregl.Map | null>
  mapLoaded: boolean
  currentTaskId?: number
  challengeId?: number
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
}: TasksTablePanelProps) => {
  const [boundsString, setBoundsString] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(50)
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<number>>(new Set())
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null)
  const [commentText, setCommentText] = useState('')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { setHoveredTaskId, setSelectedTaskIds: setMapSelectedTaskIds } = useMapContext()

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
    enabled: !!boundsString && mapLoaded,
  })

  const handleTaskClick = async (taskId: number) => {
    await navigate({ to: '/tasks/$taskId', params: { taskId: String(taskId) } })
  }

  const displayedTasks = tasksResponse?.data || []
  const taskCount = tasksResponse?.total ?? 0
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
    setMapSelectedTaskIds(Array.from(selectedTaskIds))
  }, [selectedTaskIds, setMapSelectedTaskIds])

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

  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-900">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-zinc-200 border-b bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-sm">Visible Tasks</h3>
          <span className="rounded-full bg-zinc-200 px-2 py-0.5 font-medium text-xs dark:bg-zinc-800">
            {isLoading
              ? 'Loading...'
              : taskCount > 0
                ? `${startIndex}-${endIndex} of ${taskCount}`
                : '0 tasks'}
          </span>
        </div>
      </div>

      {/* Table Content */}
      <div className="max-h-[500px] min-h-0 flex-1 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 border-zinc-200 border-b bg-zinc-100 text-xs text-zinc-700 uppercase dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
            <tr>
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={
                    displayedTasks.length > 0 && selectedTaskIds.size === displayedTasks.length
                  }
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-zinc-300 bg-white text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 dark:border-zinc-600 dark:bg-zinc-700"
                />
              </th>
              <th className="w-12 px-4 py-3"></th>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Location</th>
              <th className="w-12 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {isLoading ? (
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
                const isCurrentTask = currentTaskId && task.id === currentTaskId
                const isSelected = selectedTaskIds.has(task.id)
                const isExpanded = expandedTaskId === task.id

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
                      'transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800',
                      isCurrentTask && 'bg-blue-50 dark:bg-blue-900/20',
                      isSelected && 'bg-yellow-50 dark:bg-yellow-900/10'
                    )}
                  >
                    <td className="whitespace-nowrap px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleSelectTask(task.id)
                        }}
                        className="h-4 w-4 rounded border-zinc-300 bg-white text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 dark:border-zinc-600 dark:bg-zinc-700"
                      />
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
                    <td
                      className="cursor-pointer whitespace-nowrap px-4 py-3 font-medium"
                      onClick={() => handleTaskClick(task.id)}
                    >
                      {isCurrentTask && (
                        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-blue-500" />
                      )}
                      {task.id}
                    </td>
                    <td
                      className="cursor-pointer whitespace-nowrap px-4 py-3"
                      onClick={() => handleTaskClick(task.id)}
                    >
                      <span
                        className={cn(
                          'rounded-full px-2 py-1 font-medium text-xs',
                          STATUS_COLORS[task.status ?? 0] || STATUS_COLORS[0]
                        )}
                      >
                        {STATUS_LABELS[task.status ?? 0] || 'Unknown'}
                      </span>
                    </td>
                    <td
                      className="cursor-pointer whitespace-nowrap px-4 py-3"
                      onClick={() => handleTaskClick(task.id)}
                    >
                      <span className="text-zinc-600 dark:text-zinc-400">
                        {PRIORITY_LABELS[task.priority ?? 0] || `Priority ${task.priority ?? 0}`}
                      </span>
                    </td>
                    <td
                      className="cursor-pointer whitespace-nowrap px-4 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-400"
                      onClick={() => handleTaskClick(task.id)}
                    >
                      {lat.toFixed(4)}, {lng.toFixed(4)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {comments && expandedTaskId === task.id && (
                        <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                          <MessageSquare className="h-4 w-4" />
                          <span className="text-xs">{comments.length}</span>
                        </div>
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
            disabled={currentPage === 0 || isLoading}
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages - 1 || isLoading}
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
