import { Link } from '@tanstack/react-router'
import { ArrowLeft, Calendar, Edit, User } from 'lucide-react'
import { api } from '@/api'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Separator } from '@/components/ui/Separator'
import { useBrowsedProjectContext } from '@/contexts/browseProject/BrowsedProjectContext'
import { useSuspenseQuery } from '@tanstack/react-query'

export const ProjectDetail = () => {
  const { project } = useBrowsedProjectContext()

  const { data: challenges = [] } = useSuspenseQuery(
    api.project.getProjectChallenges(project.id)
  )

  // Calculate project statistics
  // Note: Challenge objects have tasksRemaining and completionPercentage
  // We'll estimate total tasks from remaining and completion percentage
  const remainingTasks = challenges.reduce(
    (sum, challenge) => sum + (challenge.tasksRemaining || 0),
    0
  )
  
  // Calculate total tasks from remaining and completion percentage
  const totalTasks = challenges.reduce((sum, challenge) => {
    const remaining = challenge.tasksRemaining || 0
    const completion = challenge.completionPercentage || 0
    if (completion > 0 && remaining > 0) {
      // If we know completion % and remaining, we can estimate total
      // remaining = total * (1 - completion/100)
      // total = remaining / (1 - completion/100)
      return sum + Math.round(remaining / (1 - completion / 100))
    } else if (remaining > 0) {
      // If no completion data, just use remaining as estimate
      return sum + remaining
    }
    return sum
  }, 0)
  
  const completedTasks = totalTasks - remainingTasks
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return 'N/A'
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-6 p-6">
          {/* Go Back Link */}
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Link>

          {/* Project Title */}
          <div className="flex flex-col gap-2">
            <h1 className="font-bold text-2xl text-zinc-900 dark:text-zinc-50">
              {project.displayName || project.name}
            </h1>
            {project.featured && (
              <Badge
                variant="secondary"
                className="w-fit bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                FEATURED
              </Badge>
            )}
          </div>

          {/* Metadata */}
          <div className="flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            {project.owner && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>
                  <span className="font-semibold">OWNER:</span> {project.owner}
                </span>
              </div>
            )}
            {project.created && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  <span className="font-semibold">CREATED:</span> {formatDate(project.created)}
                </span>
              </div>
            )}
            {project.modified && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  <span className="font-semibold">MODIFIED:</span> {formatDate(project.modified)}
                </span>
              </div>
            )}
          </div>

          {/* View Leaderboard Link */}
          <Link
            to="/leaderboard"
            className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            View Leaderboard
          </Link>

          <Separator />

          {/* Description */}
          {project.description && (
            <div className="flex flex-col gap-2">
              <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                {project.description}
              </p>
            </div>
          )}

          <Separator />

          {/* Progress Statistics */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  {Math.round(completionPercentage)}% FIXED ({completedTasks}/{totalTasks})
                </span>
                <span className="text-zinc-500 dark:text-zinc-400">
                  {Math.round(((remainingTasks / totalTasks) * 100) || 0)}% REMAINING (
                  {remainingTasks}/{totalTasks})
                </span>
              </div>
              {/* Progress Bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-semibold">Tasks Remaining:</span> {remainingTasks.toLocaleString()}{' '}
              ({Math.round(((remainingTasks / totalTasks) * 100) || 0)}%) of {totalTasks.toLocaleString()}
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <Button variant="default" className="w-full">
              Review Again
            </Button>
            <Link to="/manage/project/$projectId" params={{ projectId: String(project.id) }}>
              <Button variant="outline" className="w-full">
                <Edit className="mr-2 h-4 w-4" />
                Manage
              </Button>
            </Link>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

