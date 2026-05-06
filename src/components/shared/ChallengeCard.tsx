import { Link } from '@tanstack/react-router'
import { useChallengeProgress } from '@/hooks/useChallengeProgress'
import { getDifficultyLabel } from '@/lib/difficultyLevelData'
import { formatShortDate } from '@/lib/formatDate'
import { cn } from '@/lib/utils'
import type { Challenge } from '@/types/Challenge'
import { ProgressBar } from './ProgressBar'
import { SidebarIndicator } from './SidebarIndicator'

interface ChallengeCardProps {
  challenge: Challenge
  className?: string
  actions?: React.ReactNode
  linkTo?: string
  linkParams?: Record<string, string>
  linkSearch?: Record<string, unknown>
  onLinkClick?: () => void
}

export const ChallengeCard = ({
  challenge,
  actions,
  className,
  linkTo,
  linkParams,
  linkSearch,
  onLinkClick,
}: ChallengeCardProps) => {
  const {
    completionPercentage,
    segments,
    total: statsTotal,
    tasksRemaining: statsRemaining,
  } = useChallengeProgress(challenge.id)
  const metricsRemaining = challenge.completionMetrics?.tasksRemaining
  const tasksRemaining = statsRemaining > 0 ? statsRemaining : (metricsRemaining ?? 0)
  const fallbackPercentage = challenge.completionPercentage || 0
  const pct = completionPercentage || fallbackPercentage
  const totalTasks =
    statsTotal > 0
      ? statsTotal
      : pct > 0 && pct < 100
        ? Math.round(tasksRemaining / (1 - pct / 100))
        : pct >= 100
          ? 0
          : tasksRemaining
  const lastUpdated = challenge.modified || challenge.lastTaskRefresh

  return (
    <Link
      to={linkTo ?? '/challenge/$challengeId'}
      params={linkParams ?? { challengeId: challenge.id.toString() }}
      search={linkSearch}
      onClick={onLinkClick}
      className={cn(
        'group relative block overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:shadow-none dark:hover:brightness-110',
        className
      )}
    >
      {actions && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1">{actions}</div>
      )}
      <SidebarIndicator avatar={challenge.avatar} />
      <div className="p-4">
        <div
          className={cn(
            'mb-2 text-xs text-zinc-500 dark:text-slate-300',
            challenge.avatar && 'mr-16'
          )}
        >
          Project {challenge.parent}
        </div>

        <h3
          className={cn(
            'mb-3 flex h-10 items-center font-semibold text-base text-zinc-900 leading-tight dark:text-white',
            challenge.avatar && 'mr-16'
          )}
        >
          <span className="line-clamp-2">{challenge.name}</span>
        </h3>

        <div>
          <div className="mb-1 text-xs text-zinc-500 dark:text-slate-300">
            <span className="font-semibold text-zinc-900 dark:text-white">
              {tasksRemaining} / {totalTasks}
            </span>{' '}
            tasks remaining
          </div>

          <ProgressBar
            segments={segments.length > 0 ? segments : undefined}
            percentage={segments.length > 0 ? undefined : pct}
            className="mb-3"
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 dark:text-slate-300">
              {getDifficultyLabel(challenge.difficulty)}
            </span>
            {lastUpdated ? (
              <span className="text-xs text-zinc-500 dark:text-slate-300">
                Last updated {formatShortDate(lastUpdated)}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  )
}
