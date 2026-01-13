import { useTaskContext } from '../contexts/TaskContext'
import { BundleToggle } from '../BundleToggle'
import { TaskFavoriteButton } from './TaskFavoriteButton'
import { TaskShareMenu } from './TaskShareMenu'
import { TaskStatusBadge } from './TaskStatusBadge'

export const TasksHeader = () => {
  const { task } = useTaskContext()

  return (
    <div className="flex flex-1 items-center justify-between space-x-4">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2.5">
            <span className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Task #{task.id}
            </span>
            <TaskStatusBadge status={task.status} />
          </div>
          {task.name && (
            <span className="max-w-md truncate font-medium text-sm text-zinc-600 dark:text-zinc-400">
              {task.name}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-1.5">
        <BundleToggle />
        <TaskShareMenu task={task} />
        <TaskFavoriteButton />
      </div>
    </div>
  )
}
