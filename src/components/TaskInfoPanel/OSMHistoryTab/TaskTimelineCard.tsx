import { useIntl } from '@/i18n'
import { formatDate } from '@/lib/date'
import type { Task } from '@/types/Task'

interface TaskTimelineCardProps {
  task: Task
}

export const TaskTimelineCard = ({ task }: TaskTimelineCardProps) => {
  const { t } = useIntl()

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
      <div className="font-medium text-sm text-zinc-900 dark:text-white">
        {t('taskInfoPanel.osmHistory.timeline.title', undefined, 'Task Timeline')}
      </div>
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500 dark:text-slate-400">
            {t('taskInfoPanel.osmHistory.timeline.created', undefined, 'Created')}
          </span>
          <span className="font-medium text-zinc-900 dark:text-white">
            {formatDate(new Date(task.created))}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500 dark:text-slate-400">
            {t('taskInfoPanel.osmHistory.timeline.lastModified', undefined, 'Last Modified')}
          </span>
          <span className="font-medium text-zinc-900 dark:text-white">
            {formatDate(new Date(task.modified))}
          </span>
        </div>
        {task.mappedOn && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-slate-400">
              {t('taskInfoPanel.osmHistory.timeline.completed', undefined, 'Completed')}
            </span>
            <span className="font-medium text-zinc-900 dark:text-white">
              {formatDate(new Date(task.mappedOn))}
            </span>
          </div>
        )}
        {task.completedTimeSpent && task.completedTimeSpent > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-slate-400">
              {t('taskInfoPanel.osmHistory.timeline.timeSpent', undefined, 'Time Spent')}
            </span>
            <span className="font-medium text-zinc-900 dark:text-white">
              {t(
                'taskInfoPanel.osmHistory.timeline.minutes',
                { count: Math.round(task.completedTimeSpent / 1000 / 60) },
                '{count} minutes'
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
