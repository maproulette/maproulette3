import { Link } from '@tanstack/react-router'
import { Settings } from 'lucide-react'
import { api } from '@/api'
import { isSuperUser } from '@/components/shared/SuperAdminGuard'
import { useAuthContext } from '@/contexts/AuthContext'
import { canManageChallenge } from '@/utils/challengePermissions'
import { useTaskContext } from '../contexts/TaskContext'
import { TaskFavoriteButton } from './TaskFavoriteButton'
import { TaskShareMenu } from './TaskShareMenu'
import { TaskStatusBadge } from './TaskStatusBadge'

export const TasksHeader = () => {
  const { task } = useTaskContext()
  const { user } = useAuthContext()
  const challengeId =
    typeof task.parent === 'number' ? task.parent : (task.parent as { id?: number })?.id
  const { data: challenge, isLoading: challengeLoading } = api.challenge.getChallenge(
    challengeId ?? 0
  )
  const canManage =
    user &&
    (isSuperUser(user) ||
      (!!challengeId && !challengeLoading && challenge != null && canManageChallenge(user, challenge)))

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
        {canManage && (
          <Link
            to="/manage/task/$taskId"
            params={{ taskId: task.id.toString() }}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            title="Manage task"
          >
            <Settings className="h-4 w-4" />
            Manage
          </Link>
        )}
        <TaskShareMenu task={task} />
        <TaskFavoriteButton />
      </div>
    </div>
  )
}
