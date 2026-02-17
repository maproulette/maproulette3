import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type { Challenge } from '@/types/Challenge'
import { getDifficultyColor, getDifficultyLabel } from '@/utils/difficultyLevelData'

interface ChallengeCardProps {
  challenge: Challenge
  className?: string
}

const getPriorityBadge = (challenge: Challenge) => {
  if (challenge.featured) {
    return (
      <Badge variant="secondary" className="text-xs">
        Featured
      </Badge>
    )
  }
  // Could add other priority levels based on challenge.defaultPriority
  return null
}

const getProgressBarColor = (percentage: number) => {
  if (percentage >= 90) return 'bg-blue-500'
  if (percentage >= 50) return 'bg-orange-500'
  return 'bg-red-500'
}

export const ChallengeCard = ({ challenge, className }: ChallengeCardProps) => {
  const completionPercentage = challenge.completionPercentage || 0
  const progressBarColor = getProgressBarColor(completionPercentage)

  return (
    <Link
      to="/challenge/$challengeId"
      params={{ challengeId: challenge.id.toString() }}
      className={cn(
        'group block overflow-hidden rounded-lg bg-white/80 p-6 shadow-sm backdrop-blur-sm transition-all hover:shadow-md dark:bg-zinc-800/50 dark:shadow-none dark:hover:bg-zinc-800/70',
        className
      )}
    >
      {/* Tags Row - Difficulty and Priority */}
      <div className="mb-3 flex items-center gap-2">
        <span className={cn('font-medium text-sm', getDifficultyColor(challenge.difficulty))}>
          {getDifficultyLabel(challenge.difficulty)}
        </span>
        {getPriorityBadge(challenge)}
      </div>

      {/* Header with Logo and Title */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center">
          {/* Placeholder for organization logo - you can add actual logo here */}
          <div className="flex h-full w-full items-center justify-center rounded bg-zinc-100 text-xs text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600">
            <svg
              className="h-8 w-8"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="Organization logo"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
        </div>
        {/* Challenge Title */}
        <h3 className="font-semibold text-lg text-zinc-900 leading-tight dark:text-zinc-50">
          {challenge.name}
        </h3>
      </div>

      {/* Tasks Remaining */}
      <div className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
          {challenge.tasksRemaining || 0}
        </span>{' '}
        tasks remaining
      </div>

      {/* Progress Bar */}
      <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div
          className={cn('h-full transition-all duration-300', progressBarColor)}
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
    </Link>
  )
}
