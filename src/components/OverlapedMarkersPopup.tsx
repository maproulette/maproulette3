import type { TaskMarker } from '@/types/Task'
import { STATUS_CONFIG } from './TaskMarkers/const'
import { router } from '@/main'

interface OverlapPopupProps {
  tasks: TaskMarker[]
}

export const OverlapPopup = ({ tasks }: OverlapPopupProps) => {
  const taskCount = tasks.length
  const displayTasks = tasks.slice(0, 10)
  const remainingCount = taskCount - 10

  const navigateToTask = (taskId: string) => {
    router.navigate({ to: '/tasks/$taskId', params: { taskId } })
  }

  return (
    <div className="font-sans w-auto box-border">
      <div className="flex items-center mb-3 pb-2 border-b border-gray-200">
        <div className="min-w-0 flex-1">
          <h3 className="m-0 text-sm font-semibold text-gray-800 break-words">
            {taskCount} Overlapping Tasks
          </h3>
        </div>
      </div>

      <div className="mb-3">
        <div className="text-xs text-gray-500 font-medium mb-1.5">Tasks:</div>
        <div className="max-h-[200px] overflow-y-auto">
          {displayTasks.map((task) => {
            const statusConfig = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG]
            return (
              <button
                key={task.id}
                type="button"
                onClick={() => navigateToTask(task.id)}
                className="w-full flex items-center justify-between p-1.5 px-2 my-0.5 bg-gray-50 rounded border-l-[3px] hover:bg-gray-100 transition-colors min-w-0 cursor-pointer text-left"
                style={{ borderLeftColor: statusConfig.color }}
              >
                <div className="flex-1 min-w-0 mr-2">
                  <div className="text-[13px] font-medium text-gray-800 break-words">
                    Task #{task.id}
                  </div>
                </div>
                <div className="flex items-center flex-shrink-0">
                  <div
                    className="w-1.5 h-1.5 rounded-full mr-1"
                    style={{ backgroundColor: statusConfig.color }}
                  />
                  <span className="text-[10px] text-gray-500 whitespace-nowrap">
                    {statusConfig.label}
                  </span>
                </div>
              </button>
            )
          })}
          {remainingCount > 0 && (
            <div className="text-center text-[11px] text-gray-500 mt-2 italic">
              +{remainingCount} more task{remainingCount === 1 ? '' : 's'}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={() => navigateToTask(tasks[0]?.id || '')}
          className="flex-1 py-2 px-3 text-xs font-medium text-white bg-green-500 border border-green-500 rounded-md hover:bg-green-600 transition-all text-center cursor-pointer"
        >
          Start First Task
        </button>
      </div>
    </div>
  )
}

export const SingleTaskPopup = ({ task }: { task: TaskMarker }) => {
  const statusInfo = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG[0]

  const navigateToTask = () => {
    router.navigate({ to: '/tasks/$taskId', params: { taskId: task.id } })
  }

  return (
    <div className="font-sans w-auto box-border">
      <div className="flex items-center mb-3 pb-2 border-b border-gray-200">
        <div className="min-w-0 flex-1">
          <h3 className="m-0 text-sm font-semibold text-gray-800 break-words">
            Task #{task.id}
          </h3>
        </div>
      </div>

      <div className="mb-3">
        <div className="text-xs text-gray-500 font-medium mb-1.5">Status:</div>
        <div
          className="flex items-center p-1.5 px-2 bg-gray-50 rounded border-l-[3px]"
          style={{ borderLeftColor: statusInfo.color }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full mr-1.5"
            style={{ backgroundColor: statusInfo.color }}
          />
          <span className="text-[13px] text-gray-700">{statusInfo.label}</span>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={navigateToTask}
          className="flex-1 py-2 px-3 text-xs font-medium text-white bg-green-500 border border-green-500 rounded-md hover:bg-green-600 transition-all text-center cursor-pointer"
        >
          Start Task
        </button>
      </div>
    </div>
  )
}
