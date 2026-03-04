import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import type { Challenge } from '@/types/Challenge'
import { getDifficultyLabel } from '@/utils/difficultyLevelData'

interface ChallengeCardProps {
  challenge: Challenge
  className?: string
}

const getProgressBarColor = (percentage: number) => {
  if (percentage >= 90) return 'bg-blue-500'
  if (percentage >= 50) return 'bg-orange-500'
  return 'bg-red-500'
}

const getSidebarColor = (percentage: number) => {
  if (percentage >= 90) return 'bg-blue-500'
  if (percentage >= 50) return 'bg-orange-500'
  if (percentage >= 25) return 'bg-yellow-500'
  return 'bg-red-500'
}

const formatDate = (epoch: number) => {
  const date = new Date(epoch)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const year = date.getFullYear().toString().slice(-2)
  return `${month}/${day}/${year}`
}

export const ChallengeCard = ({ challenge, className }: ChallengeCardProps) => {
  const completionPercentage = challenge.completionPercentage || 0
  const tasksRemaining = challenge.tasksRemaining || 0
  const totalTasks =
    completionPercentage > 0 && completionPercentage < 100
      ? Math.round(tasksRemaining / (1 - completionPercentage / 100))
      : completionPercentage >= 100
        ? 0
        : tasksRemaining
  const progressBarColor = getProgressBarColor(completionPercentage)
  const sidebarColor = getSidebarColor(completionPercentage)
  const lastUpdated = challenge.modified || challenge.lastTaskRefresh

  return (
    <Link
      to="/challenge/$challengeId"
      params={{ challengeId: challenge.id.toString() }}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-[rgba(51,65,85,1)] bg-[rgba(30,41,59,1)] transition-all hover:brightness-110',
        className
      )}
    >
      <div className="p-4">
        <div
          className={cn('absolute top-2 right-2 h-12 w-12 shrink-0 rounded-lg', sidebarColor)}
        />

        <div className="mr-16 mb-2 text-xs text-slate-300">
          Project {challenge.parent}
        </div>

        <h3 className="mr-16 mb-3 font-semibold text-base text-white leading-tight">
          {challenge.name}
        </h3>

        <div>
          <div className="mb-1 text-xs text-slate-300">
            <span className="font-semibold text-white">
              {tasksRemaining} / {totalTasks}
            </span>{' '}
            tasks remaining
          </div>

          <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-500">
            <div
              className={cn('h-full transition-all duration-300', progressBarColor)}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300">
              {getDifficultyLabel(challenge.difficulty)}
            </span>
            {lastUpdated ? (
              <span className="text-xs text-slate-300">
                Last updated {formatDate(lastUpdated)}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  )
}
