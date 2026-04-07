import { Link } from '@tanstack/react-router'
import { Clock, Lock, Settings } from 'lucide-react'
import { api } from '@/api'
import { Loader } from '@/components/ui/Loader'
import { useAuthContext } from '@/contexts/AuthContext'
import { isSuperUser } from '@/lib/SuperAdminGuard'

interface LockedTasksSectionProps {
  userId: number
}

const formatTimeAgo = (epoch: number): string => {
  // API returns epoch in seconds, convert to milliseconds
  const epochMs = epoch < 10000000000 ? epoch * 1000 : epoch
  const seconds = Math.floor((Date.now() - epochMs) / 1000)

  if (seconds < 0) return 'just now'
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export const LockedTasksSection = ({ userId }: LockedTasksSectionProps) => {
  const { user } = useAuthContext()
  const { data: lockedTasks, isLoading, error } = api.user.lockedTasks(userId)
  const showManageIcon = user && isSuperUser(user)

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-800">
      <div className="flex shrink-0 items-center gap-2 px-4 py-3">
        <Lock className="h-4 w-4 text-orange-400" />
        <h3 className="font-medium text-sm text-zinc-800 dark:text-slate-200">Locked Tasks</h3>
        {lockedTasks && lockedTasks.length > 0 && (
          <span className="ml-auto rounded-full bg-orange-500/20 px-2 py-0.5 font-medium text-orange-400 text-xs">
            {lockedTasks.length}
          </span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {isLoading && (
          <div className="flex justify-center py-4">
            <Loader />
          </div>
        )}

        {error && <div className="py-2 text-center text-red-400 text-sm">Failed to load</div>}

        {!isLoading && !error && lockedTasks?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="mb-2 rounded-lg bg-zinc-100 p-2 dark:bg-slate-700/50">
              <Lock className="h-5 w-5 text-zinc-400 dark:text-slate-500" />
            </div>
            <p className="text-sm text-zinc-600 dark:text-slate-400">No locked tasks</p>
            <p className="text-xs text-zinc-500">Start editing a task to lock it</p>
          </div>
        )}

        {!isLoading && !error && lockedTasks && lockedTasks.length > 0 && (
          <div className="space-y-2">
            {lockedTasks.map((task) => (
              <Link
                key={task.id}
                to="/tasks/$taskId"
                params={{ taskId: task.id.toString() }}
                className="flex items-center justify-between rounded-lg bg-orange-100 p-3 transition-colors hover:bg-orange-200 dark:bg-orange-500/10 dark:hover:bg-orange-500/20"
              >
                <div className="flex items-center gap-2.5">
                  <Lock className="h-4 w-4 text-orange-400" />
                  <div>
                    <div className="font-medium text-sm text-zinc-800 dark:text-slate-200">
                      Task #{task.id}
                    </div>
                    <div className="text-xs text-zinc-600 dark:text-slate-400">
                      {task.parentName}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-zinc-600 dark:text-slate-500">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(task.startedAt)}
                  </div>
                  {showManageIcon && (
                    <Link
                      to="/manage/task/$taskId"
                      params={{ taskId: task.id.toString() }}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-orange-200 hover:text-zinc-700 dark:text-slate-400 dark:hover:bg-orange-500/30 dark:hover:text-zinc-100"
                      title="Manage task"
                    >
                      <Settings className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
