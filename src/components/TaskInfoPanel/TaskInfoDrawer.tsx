import { useNavigate } from '@tanstack/react-router'
import { Package, Play, X, ZoomIn } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { MapRef } from 'react-map-gl/maplibre'
import ReactMarkdown from 'react-markdown'
import { api } from '@/api'
import { TaskContext } from '@/components/Pages/TaskEditPage/contexts/TaskContext'
import { TaskMetadata } from '@/components/TaskInfoPanel/TaskMetadata'
import { Drawer } from '@/components/ui/Drawer'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/taskConstants'
import { cn } from '@/lib/utils'
import type { Task, TaskMarker } from '@/types/Task'
import { TaskTabs } from './TaskTabs'

const noop = () => {}

interface TaskInfoDrawerProps {
  selectedTask: TaskMarker | null
  onClose: () => void
  mapRef: React.RefObject<MapRef | null>
}

export const TaskInfoDrawer = ({ selectedTask, onClose, mapRef }: TaskInfoDrawerProps) => {
  const navigate = useNavigate()
  const [drawerState, setDrawerState] = useState<'closed' | 'open' | 'sliding-out'>('closed')

  const { data: fullTask } = api.task.getTask(selectedTask?.id ?? 0)
  const task = fullTask as Task | undefined

  const { data: challenge } = api.challenge.getChallenge(task?.parent ?? 0)
  const { data: project } = api.project.getProject(challenge?.parent)
  const { data: bundleData } = api.taskBundle.getTaskBundle(task?.bundleId ?? 0)

  const shouldBeOpen = selectedTask !== null
  const targetTaskId = selectedTask?.id ?? null

  const prevTargetRef = useRef(targetTaskId)
  const drawerStateRef = useRef(drawerState)
  drawerStateRef.current = drawerState
  useEffect(() => {
    const prevTarget = prevTargetRef.current
    prevTargetRef.current = targetTaskId

    if (!shouldBeOpen) {
      setDrawerState('closed')
      return
    }

    if (drawerStateRef.current === 'closed') {
      setDrawerState('open')
    } else if (drawerStateRef.current === 'open' && prevTarget !== targetTaskId) {
      setDrawerState('sliding-out')
      const timer = setTimeout(() => {
        setDrawerState('open')
      }, 320)
      return () => clearTimeout(timer)
    }
  }, [shouldBeOpen, targetTaskId])

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
    mapRef.current.jumpTo({
      center: [selectedTask.location.lng, selectedTask.location.lat],
      zoom: 16,
    })
  }

  const status = task?.status ?? selectedTask?.status ?? 0
  const statusLabel = STATUS_LABELS[status] || 'Unknown'
  const statusColor = STATUS_COLORS[status] || 'bg-zinc-500'

  // Provide a TaskContext so tab descendants (PropertiesTab, CommentsHistoryTab,
  // OSMHistoryTab, TaskTab) work outside the task-edit route. Lock-related
  // methods are no-ops here — the drawer is read-only on browse/explore/
  // prioritization pages.
  const taskContextValue = useMemo(
    () =>
      task
        ? { task, isLocked: false, isLocking: false, lockTask: noop, unlockTask: noop }
        : undefined,
    [task]
  )

  return (
    <Drawer open={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="shrink-0 space-y-1 border-zinc-200 border-b bg-gradient-to-r from-purple-200 via-purple-100/50 to-transparent px-4 pt-3 pb-3 dark:border-slate-700 dark:from-purple-800/50 dark:via-purple-900/25 dark:to-transparent">
        {/* Task ID + Status + Action buttons */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-zinc-900 dark:text-white">
            Task #{selectedTask?.id}
          </span>
          <div
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5 font-medium text-white text-xs',
              statusColor
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
            {statusLabel}
          </div>
          <div className="ml-auto flex items-center gap-1">
            {selectedTask?.location && (
              <button
                type="button"
                onClick={handleZoomToTask}
                className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                title="Zoom to task"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleStartTask}
              className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              title="Start task"
            >
              <Play className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              aria-label="Close drawer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <TaskMetadata taskName={task?.name} challenge={challenge} project={project} />
      </div>

      {/* Tabs */}
      {isOpen && task && taskContextValue && (
        <TaskContext.Provider value={taskContextValue}>
          <TaskTabs
            task={task}
            taskTabContent={
              <div className="space-y-3">
                {/* Bundle Info */}
                {bundleData && bundleData.taskIds.length > 1 && (
                  <div>
                    <div className="flex items-center gap-2 pb-2">
                      <Package className="h-3.5 w-3.5 text-zinc-400" />
                      <span className="font-medium text-xs text-zinc-500 uppercase tracking-wide dark:text-slate-400">
                        Bundled Tasks ({bundleData.taskIds.length - 1})
                      </span>
                    </div>
                    <div className="max-h-48 space-y-1 overflow-y-auto">
                      {bundleData.taskIds
                        .filter((id) => id !== task.id)
                        .map((taskId) => (
                          <button
                            key={taskId}
                            type="button"
                            onClick={() =>
                              navigate({
                                to: '/tasks/$taskId',
                                params: { taskId: taskId.toString() },
                              })
                            }
                            className="flex h-8 w-full items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-left text-sm transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-700 dark:hover:bg-blue-950/30"
                          >
                            <span className="font-medium text-xs text-zinc-600 dark:text-slate-300">
                              Task #{taskId}
                            </span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* Challenge Instructions */}
                {challenge?.instruction && (
                  <div>
                    <h3 className="mb-2 font-semibold text-xs text-zinc-500 uppercase tracking-wide dark:text-slate-400">
                      Instructions
                    </h3>
                    <div className="text-sm text-zinc-700 leading-relaxed dark:text-slate-300 [&_a]:text-blue-600 [&_a]:hover:underline [&_a]:dark:text-blue-400 [&_blockquote]:my-2 [&_blockquote]:border-zinc-300 [&_blockquote]:border-l-2 [&_blockquote]:pl-2 [&_blockquote]:italic [&_blockquote]:dark:border-slate-600 [&_code]:rounded [&_code]:bg-zinc-200 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:dark:bg-slate-800 [&_li]:my-0.5 [&_ol]:my-1 [&_ol]:ml-4 [&_ol]:list-decimal [&_p]:my-1 [&_p]:first:mt-0 [&_ul]:my-1 [&_ul]:ml-4 [&_ul]:list-disc">
                      <ReactMarkdown
                        components={{
                          a: (props) => (
                            <a
                              {...props}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline dark:text-blue-400"
                            />
                          ),
                        }}
                      >
                        {challenge.instruction}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            }
          />
        </TaskContext.Provider>
      )}
    </Drawer>
  )
}
