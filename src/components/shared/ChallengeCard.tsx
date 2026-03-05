import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import type { Challenge } from '@/types/Challenge'
import type { Project } from '@/types/Project'
import { getDifficultyLabel } from '@/utils/difficultyLevelData'

export interface ChallengeMeta {
  totalChallenges: number
  pinned: number
  completed: number
}

interface ChallengeCardBaseProps {
  className?: string
  actions?: React.ReactNode
  linkTo?: string
  linkParams?: Record<string, string>
}

interface ChallengeVariant extends ChallengeCardBaseProps {
  variant?: 'challenge'
  challenge: Challenge
  project?: never
  challengeMeta?: never
}

interface ProjectVariant extends ChallengeCardBaseProps {
  variant: 'project'
  project: Project
  challengeMeta?: ChallengeMeta
  challenge?: never
}

export type ChallengeCardProps = ChallengeVariant | ProjectVariant

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

export const ChallengeCard = (props: ChallengeCardProps) => {
  if (props.variant === 'project') {
    return <ProjectCard {...props} />
  }
  return <ChallengeCardInner {...props} />
}

const ChallengeCardInner = ({ challenge, actions, className, linkTo, linkParams }: ChallengeVariant) => {
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
      to={linkTo ?? '/challenge/$challengeId'}
      params={linkParams ?? { challengeId: challenge.id.toString() }}
      className={cn(
        'group relative block overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:shadow-none dark:hover:brightness-110',
        className
      )}
    >
      {actions && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1">{actions}</div>
      )}
      <div className={cn('absolute top-12 right-4 h-12 w-12 rounded-lg', sidebarColor)} />
      <div className="p-4">
        <div className="mr-16 mb-2 text-xs text-zinc-500 dark:text-slate-300">
          Project {challenge.parent}
        </div>

        <h3 className="mr-16 mb-3 flex h-[2.5rem] items-center font-semibold text-base text-zinc-900 leading-tight dark:text-white">
          <span className="line-clamp-2">{challenge.name}</span>
        </h3>

        <div>
          <div className="mb-1 text-xs text-zinc-500 dark:text-slate-300">
            <span className="font-semibold text-zinc-900 dark:text-white">
              {tasksRemaining} / {totalTasks}
            </span>{' '}
            tasks remaining
          </div>

          <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-slate-500">
            <div
              className={cn('h-full transition-all duration-300', progressBarColor)}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 dark:text-slate-300">
              {getDifficultyLabel(challenge.difficulty)}
            </span>
            {lastUpdated ? (
              <span className="text-xs text-zinc-500 dark:text-slate-300">
                Last updated {formatDate(lastUpdated)}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  )
}

const ProjectCard = ({ project, challengeMeta, actions, className, linkTo, linkParams }: ProjectVariant) => {
  const meta = challengeMeta ?? { totalChallenges: 10, pinned: 3, completed: 4 }
  const completionPercentage =
    meta.totalChallenges > 0 ? Math.round((meta.completed / meta.totalChallenges) * 100) : 0
  const progressBarColor = getProgressBarColor(completionPercentage)
  const sidebarColor = getSidebarColor(completionPercentage)
  const lastUpdated = project.modified

  return (
    <Link
      to={linkTo ?? '/project/$projectId'}
      params={linkParams ?? { projectId: String(project.id) }}
      className={cn(
        'group relative block overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:shadow-none dark:hover:brightness-110',
        className
      )}
    >
      {actions && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1">{actions}</div>
      )}
      <div className={cn('absolute top-12 right-4 h-12 w-12 rounded-lg', sidebarColor)} />
      <div className="p-4">
        <div className="mr-16 mb-2 text-xs text-zinc-500 dark:text-slate-300">
          {project.displayName || project.name}
        </div>

        <h3 className="mr-16 mb-3 flex h-[2.5rem] items-center font-semibold text-base text-zinc-900 leading-tight dark:text-white">
          <span className="line-clamp-2">{project.displayName || project.name}</span>
        </h3>

        <div>
          <div className="mb-1 text-xs text-zinc-500 dark:text-slate-300">
            <span className="font-semibold text-zinc-900 dark:text-white">
              {meta.totalChallenges - meta.completed} / {meta.totalChallenges}
            </span>{' '}
            tasks remaining
          </div>

          <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-slate-500">
            <div
              className={cn('h-full transition-all duration-300', progressBarColor)}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-3 text-xs text-zinc-500 dark:text-slate-300">
            <span className="flex items-center gap-3">
              <span>Total Challenges: {meta.totalChallenges}</span>
              <span className="text-emerald-500">Completed: {meta.completed}</span>
              {meta.pinned > 0 && (
                <span className="text-yellow-500">Pinned: {meta.pinned}</span>
              )}
            </span>
            {lastUpdated ? <span>Last updated {formatDate(lastUpdated)}</span> : null}
          </div>
        </div>
      </div>
    </Link>
  )
}
