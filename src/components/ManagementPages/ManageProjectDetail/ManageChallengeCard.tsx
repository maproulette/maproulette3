import { Link } from '@tanstack/react-router'
import {
  Archive,
  ArrowRightLeft,
  Copy,
  Hammer,
  MoreHorizontal,
  Pencil,
  Pin,
  Play,
  Trash2,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { cn } from '@/utils/utils'
import type { Challenge } from '@/types/Challenge'
import { getDifficultyColor, getDifficultyLabel } from '@/utils/difficultyLevelData'

interface ManageChallengeCardProps {
  challenge: Challenge
  onMoveClick: () => void
  isPinned?: boolean
  onTogglePin?: () => void
  onCloneClick?: () => void
  onDeleteClick?: () => void
  onArchiveClick?: () => void
  onRebuildClick?: () => void
  onToggleVisibility?: () => void
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
  return null
}

const getProgressBarColor = (percentage: number) => {
  if (percentage >= 90) return 'bg-blue-500'
  if (percentage >= 50) return 'bg-orange-500'
  return 'bg-red-500'
}

export const ManageChallengeCard = ({
  challenge,
  onMoveClick,
  isPinned = false,
  onTogglePin,
  onCloneClick,
  onDeleteClick,
  onArchiveClick,
  onRebuildClick,
  onToggleVisibility,
  className,
}: ManageChallengeCardProps) => {
  const completionPercentage = challenge.completionPercentage || 0
  const progressBarColor = getProgressBarColor(completionPercentage)
  const tasksRemaining = challenge.tasksRemaining ?? 0
  const canStartChallenge = tasksRemaining > 0

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg bg-white/80 p-6 shadow-sm backdrop-blur-sm transition-all hover:shadow-md dark:bg-zinc-800/50 dark:shadow-none dark:hover:bg-zinc-800/70',
        isPinned && 'border-l-4 border-l-amber-500',
        className
      )}
    >
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1">
        {onTogglePin && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.preventDefault()
              onTogglePin()
            }}
            title={isPinned ? 'Unpin challenge' : 'Pin challenge'}
            aria-label={isPinned ? 'Unpin challenge' : 'Pin challenge'}
          >
            <Pin
              className={cn(
                'h-4 w-4',
                isPinned
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-400'
              )}
            />
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canStartChallenge && (
              <DropdownMenuItem asChild>
                <Link
                  to="/challenge/$challengeId"
                  params={{ challengeId: String(challenge.id) }}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Start challenge
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link
                to="/manage/challenge/$challengeId/edit"
                params={{ challengeId: String(challenge.id) }}
                className="flex cursor-pointer items-center gap-2"
              >
                <Pencil className="h-4 w-4" />
                Edit challenge
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onMoveClick}
              className="flex cursor-pointer items-center gap-2"
            >
              <ArrowRightLeft className="h-4 w-4" />
              Move challenge
            </DropdownMenuItem>
            {onCloneClick && (
              <DropdownMenuItem
                onClick={onCloneClick}
                className="flex cursor-pointer items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Clone challenge
              </DropdownMenuItem>
            )}
            {onArchiveClick && (
              <DropdownMenuItem
                onClick={onArchiveClick}
                className="flex cursor-pointer items-center gap-2"
              >
                <Archive className="h-4 w-4" />
                {challenge.isArchived ? 'Unarchive challenge' : 'Archive challenge'}
              </DropdownMenuItem>
            )}
            {onRebuildClick && (
              <DropdownMenuItem
                onClick={onRebuildClick}
                className="flex cursor-pointer items-center gap-2"
              >
                <Hammer className="h-4 w-4" />
                Rebuild tasks
              </DropdownMenuItem>
            )}
            {onToggleVisibility && (
              <DropdownMenuItem
                onClick={onToggleVisibility}
                className="flex cursor-pointer items-center gap-2"
              >
                {challenge.enabled ? 'Disable challenge' : 'Enable challenge'}
              </DropdownMenuItem>
            )}
            {onDeleteClick && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDeleteClick}
                  className="flex cursor-pointer items-center gap-2 text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete challenge
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Link
        to="/challenge/$challengeId"
        params={{ challengeId: challenge.id.toString() }}
        className="block pr-10"
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center">
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
          {getPriorityBadge(challenge)}
        </div>

        <div className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">#{challenge.id}</div>

        <h3 className="mb-3 font-semibold text-lg text-zinc-900 leading-tight dark:text-zinc-50">
          {challenge.name}
        </h3>

        <p className="mb-4 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
          {challenge.blurb || challenge.description || 'No description available'}
        </p>

        <div className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {challenge.tasksRemaining || 0}
          </span>{' '}
          tasks remaining
        </div>

        <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className={cn('h-full transition-all duration-300', progressBarColor)}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        <div className="flex items-center justify-start">
          <span className={cn('font-medium text-sm', getDifficultyColor(challenge.difficulty))}>
            {getDifficultyLabel(challenge.difficulty)}
          </span>
        </div>
      </Link>
    </div>
  )
}
