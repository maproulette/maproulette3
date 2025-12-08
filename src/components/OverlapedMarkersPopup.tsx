import { ChevronRight, Layers, MapPin, Play } from 'lucide-react'
import { STATUS_CONFIG } from '@/components/shared/TaskMarkers/const'
import { router } from '@/main'
import type { TaskMarker } from '@/types/Task'

interface OverlapPopupProps {
  tasks: TaskMarker[]
}

export const OverlapPopup = ({ tasks }: OverlapPopupProps) => {
  const taskCount = tasks.length
  const displayTasks = tasks.slice(0, 8)
  const remainingCount = taskCount - 8

  const navigateToTask = (taskId: string) => {
    router.navigate({ to: '/tasks/$taskId', params: { taskId } })
  }

  return (
    <div className="w-[280px] font-sans">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2 border-zinc-100 border-b pb-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm">
          <Layers className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-zinc-800">
            {taskCount} Overlapping Tasks
          </h3>
          <p className="text-[11px] text-zinc-500">Click a task to view details</p>
        </div>
      </div>

      {/* Task List */}
      <div className="mb-3 max-h-[220px] space-y-1.5 overflow-y-auto pr-1">
        {displayTasks.map((task) => {
          const statusConfig = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG]
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
                  <div className="font-medium text-[13px] text-zinc-800">
                    Task #{task.id}
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: statusConfig.color }}
                    />
                    <span className="text-[10px] text-zinc-500">
                      {statusConfig.label}
                    </span>
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
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-2.5 font-semibold text-sm text-white shadow-sm transition-all hover:from-emerald-600 hover:to-green-600 hover:shadow-md"
      >
        <Play className="h-4 w-4" fill="currentColor" />
        Start First Task
      </button>
    </div>
  )
}

interface SingleTaskPopupProps {
  task: TaskMarker
}

export const SingleTaskPopup = ({ task }: SingleTaskPopupProps) => {
  const statusInfo = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG[0]

  const navigateToTask = () => {
    router.navigate({ to: '/tasks/$taskId', params: { taskId: task.id.toString() } })
  }

  return (
    <div className="w-[220px] font-sans">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2.5 border-zinc-100 border-b pb-2.5">
        <div
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg shadow-sm"
          style={{ backgroundColor: statusInfo.color }}
        >
          <MapPin className="h-4.5 w-4.5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-[15px] text-zinc-800">Task #{task.id}</h3>
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

      {/* Action Button */}
      <button
        type="button"
        onClick={navigateToTask}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-2.5 font-semibold text-sm text-white shadow-sm transition-all hover:from-emerald-600 hover:to-green-600 hover:shadow-md"
      >
        <Play className="h-4 w-4" fill="currentColor" />
        Start Task
      </button>
    </div>
  )
}
