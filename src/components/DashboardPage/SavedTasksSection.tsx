import { Link } from '@tanstack/react-router'
import { BookmarkCheck, MapPin } from 'lucide-react'
import { api } from '@/api'
import { Loader } from '@/components/ui/Loader'

interface SavedTasksSectionProps {
  userId: number
}

const getStatusStyle = (status: number): { label: string; color: string } => {
  const styles: Record<number, { label: string; color: string }> = {
    0: { label: 'Created', color: 'bg-zinc-500/20 text-zinc-400' },
    1: { label: 'Fixed', color: 'bg-emerald-500/20 text-emerald-400' },
    2: { label: 'False Pos', color: 'bg-yellow-500/20 text-yellow-400' },
    3: { label: 'Skipped', color: 'bg-blue-500/20 text-blue-400' },
    4: { label: 'Deleted', color: 'bg-red-500/20 text-red-400' },
    5: { label: 'Too Hard', color: 'bg-orange-500/20 text-orange-400' },
    6: { label: 'Already Fixed', color: 'bg-purple-500/20 text-purple-400' },
  }
  return styles[status] || styles[0]
}

export const SavedTasksSection = ({ userId }: SavedTasksSectionProps) => {
  const { data: tasks, isLoading, error } = api.user.savedTasks(userId, 10)

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-xl bg-white/80 shadow-sm backdrop-blur-sm dark:bg-zinc-800/50 dark:shadow-none">
      <div className="flex shrink-0 items-center gap-2 px-4 py-3">
        <BookmarkCheck className="h-4 w-4 text-emerald-400" />
        <h3 className="font-medium text-sm text-zinc-800 dark:text-zinc-200">Saved Tasks</h3>
        {tasks && tasks.length > 0 && (
          <span className="ml-auto rounded-full bg-emerald-500/20 px-2 py-0.5 font-medium text-emerald-400 text-xs">
            {tasks.length}
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

        {!isLoading && !error && tasks?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="mb-2 rounded-lg bg-zinc-100 p-2 dark:bg-zinc-700/50">
              <BookmarkCheck className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">No saved tasks</p>
            <p className="text-xs text-zinc-500">Save tasks to work on later</p>
          </div>
        )}

        {!isLoading && !error && tasks && tasks.length > 0 && (
          <div className="space-y-2">
            {tasks.map((task) => {
              const statusStyle = getStatusStyle(task.status ?? 0)
              return (
                <Link
                  key={task.id}
                  to="/tasks/$taskId"
                  params={{ taskId: task.id.toString() }}
                  className="flex items-center justify-between rounded-lg bg-zinc-100 p-3 transition-colors hover:bg-zinc-200 dark:bg-zinc-700/30 dark:hover:bg-zinc-700/50"
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                    <div>
                      <div className="font-medium text-sm text-zinc-800 dark:text-zinc-200">
                        Task #{task.id}
                      </div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-500">
                        Challenge #{task.parent}
                      </div>
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${statusStyle.color}`}>
                    {statusStyle.label}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
