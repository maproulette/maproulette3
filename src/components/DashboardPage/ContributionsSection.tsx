import { Activity, CheckCircle2, XCircle, SkipForward, AlertTriangle, Star } from 'lucide-react'
import { api } from '@/api'
import { Loader } from '@/components/ui/Loader'

interface ContributionsSectionProps {
  userId: number
}

const taskStatusConfig: Record<
  string,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  '1': { label: 'Fixed', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  '2': { label: 'False Pos', icon: XCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  '3': { label: 'Skipped', icon: SkipForward, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  '5': { label: 'Too Hard', icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  '6': { label: 'Already Fixed', icon: Star, color: 'text-purple-400', bg: 'bg-purple-500/20' },
}

export const ContributionsSection = ({ userId }: ContributionsSectionProps) => {
  const { data: metrics, isLoading, error } = api.user.metrics(userId)

  const taskCounts = metrics?.tasks || {}
  const totalTasks = metrics?.total || 0
  const hasContributions = totalTasks > 0

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-xl bg-white/80 shadow-sm backdrop-blur-sm dark:bg-zinc-800/50 dark:shadow-none">
      <div className="flex shrink-0 items-center gap-2 px-4 py-3">
        <Activity className="h-4 w-4 text-indigo-400" />
        <h3 className="font-medium text-sm text-zinc-800 dark:text-zinc-200">Contributions</h3>
        {hasContributions && (
          <span className="ml-auto font-bold text-indigo-400 text-sm">
            {totalTasks.toLocaleString()}
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

        {!isLoading && !error && !hasContributions && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="mb-2 rounded-lg bg-zinc-100 p-2 dark:bg-zinc-700/50">
              <Activity className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">No contributions</p>
            <p className="text-xs text-zinc-500">Start mapping to track progress</p>
          </div>
        )}

        {!isLoading && !error && hasContributions && (
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(taskStatusConfig).map(([statusKey, config]) => {
              const count = taskCounts[statusKey] || 0
              if (count === 0) return null

              const Icon = config.icon

              return (
                <div
                  key={statusKey}
                  className={`flex items-center gap-2.5 rounded-lg p-2.5 ${config.bg}`}
                >
                  <Icon className={`h-4 w-4 ${config.color}`} />
                  <div className="min-w-0 flex-1">
                    <div className={`font-semibold text-sm ${config.color}`}>
                      {count.toLocaleString()}
                    </div>
                    <div className="truncate text-xs text-zinc-600 dark:text-zinc-400">{config.label}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
