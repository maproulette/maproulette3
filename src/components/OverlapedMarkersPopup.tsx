import { router } from '@/main'
import type { TaskMarker } from '@/types/Task'
import { STATUS_CONFIG } from './TaskMarkers/const'

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
    <div className="box-border·w-auto·font-sans">
      <div className="mb-3·flex·items-center·border-gray-200·border-b·pb-2">
        <div className="min-w-0 flex-1">
          <h3 className="m-0·break-words·font-semibold·text-gray-800·text-sm">
            {taskCount} Overlapping Tasks
          </h3>
        </div>
      </div>

      <div className="mb-3">
        <div className="mb-1.5·font-medium·text-gray-500·text-xs">Tasks:</div>
        <div className="max-h-[200px] overflow-y-auto">
          {displayTasks.map((task) => {
            const statusConfig = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG]
            return (
              <button
                key={task.id}
                type="button"
                onClick={() => navigateToTask(task.id.toString())}
                className="my-0.5·flex·w-full·min-w-0·cursor-pointer·items-center·justify-between·rounded·border-l-[3px]·bg-gray-50·p-1.5·px-2·text-left·transition-colors·hover:bg-gray-100"
                style={{ borderLeftColor: statusConfig.color }}
              >
                <div className="mr-2 min-w-0 flex-1">
                  <div className="break-words font-medium text-[13px] text-gray-800">
                    Task #{task.id}
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center">
                  <div
                    className="mr-1 h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: statusConfig.color }}
                  />
                  <span className="whitespace-nowrap text-[10px] text-gray-500">
                    {statusConfig.label}
                  </span>
                </div>
              </button>
            )
          })}
          {remainingCount > 0 && (
            <div className="mt-2 text-center text-[11px] text-gray-500 italic">
              +{remainingCount} more task{remainingCount === 1 ? '' : 's'}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => navigateToTask(tasks[0]?.id.toString() || '')}
          className="flex-1 cursor-pointer rounded-md border border-green-500 bg-green-500 px-3 py-2 text-center font-medium text-white text-xs transition-all hover:bg-green-600"
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
    router.navigate({ to: '/tasks/$taskId', params: { taskId: task.id.toString() } })
  }

  return (
    <div className="box-border w-auto font-sans">
      <div className="mb-3 flex items-center border-gray-200 border-b pb-2">
        <div className="min-w-0 flex-1">
          <h3 className="m-0 break-words font-semibold text-gray-800 text-sm">Task #{task.id}</h3>
        </div>
      </div>

      <div className="mb-3">
        <div className="mb-1.5 font-medium text-gray-500 text-xs">Status:</div>
        <div
          className="flex items-center rounded border-l-[3px] bg-gray-50 p-1.5 px-2"
          style={{ borderLeftColor: statusInfo.color }}
        >
          <div
            className="mr-1.5 h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: statusInfo.color }}
          />
          <span className="text-[13px] text-gray-700">{statusInfo.label}</span>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={navigateToTask}
          className="flex-1 cursor-pointer rounded-md border border-green-500 bg-green-500 px-3 py-2 text-center font-medium text-white text-xs transition-all hover:bg-green-600"
        >
          Start Task
        </button>
      </div>
    </div>
  )
}
