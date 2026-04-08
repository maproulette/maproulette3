import { formatDate } from '@/lib/formatDate'
import type { Task } from '@/types/Task'

interface TaskTimelineCardProps {
  task: Task
}

export const TaskTimelineCard = ({ task }: TaskTimelineCardProps) => {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
      <div className="font-medium text-sm text-zinc-900 dark:text-white">Task Timeline</div>
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500 dark:text-slate-400">Created</span>
          <span className="font-medium text-zinc-900 dark:text-white">
            {formatDate(task.created)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500 dark:text-slate-400">Last Modified</span>
          <span className="font-medium text-zinc-900 dark:text-white">
            {formatDate(task.modified)}
          </span>
        </div>
        {task.mappedOn && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-slate-400">Completed</span>
            <span className="font-medium text-zinc-900 dark:text-white">
              {formatDate(task.mappedOn)}
            </span>
          </div>
        )}
        {task.completedTimeSpent && task.completedTimeSpent > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-slate-400">Time Spent</span>
            <span className="font-medium text-zinc-900 dark:text-white">
              {Math.round(task.completedTimeSpent / 1000 / 60)} minutes
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
