import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/Badge'
import { ScrollArea } from '@/components/ui/ScrollArea'
import type { Challenge } from '@/types/Challenge'
import { getDifficultyColor, getDifficultyLabel } from '@/utils/difficultyLevelData'

interface ChallengesListViewProps {
  challenges: Challenge[]
}

export const ChallengesListView = ({ challenges }: ChallengesListViewProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '--'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return '--'
    }
  }

  return (
    <ScrollArea className="h-full w-full">
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-zinc-50 dark:bg-zinc-900">
            <tr className="border-zinc-200 border-b dark:border-zinc-800">
              <th className="px-4 py-3 text-left font-medium text-xs text-zinc-600 dark:text-zinc-400">
                Name
              </th>
              <th className="px-4 py-3 text-left font-medium text-xs text-zinc-600 dark:text-zinc-400">
                Author
              </th>
              <th className="px-4 py-3 text-left font-medium text-xs text-zinc-600 dark:text-zinc-400">
                Organisation
              </th>
              <th className="px-4 py-3 text-center font-medium text-xs text-zinc-600 dark:text-zinc-400">
                Percent mapped
              </th>
              <th className="px-4 py-3 text-center font-medium text-xs text-zinc-600 dark:text-zinc-400">
                Percent validated
              </th>
              <th className="px-4 py-3 text-center font-medium text-xs text-zinc-600 dark:text-zinc-400">
                Contributors
              </th>
              <th className="px-4 py-3 text-center font-medium text-xs text-zinc-600 dark:text-zinc-400">
                Priority
              </th>
              <th className="px-4 py-3 text-center font-medium text-xs text-zinc-600 dark:text-zinc-400">
                Difficulty
              </th>
              <th className="px-4 py-3 text-center font-medium text-xs text-zinc-600 dark:text-zinc-400">
                Status
              </th>
              <th className="px-4 py-3 text-left font-medium text-xs text-zinc-600 dark:text-zinc-400">
                Location
              </th>
              <th className="px-4 py-3 text-left font-medium text-xs text-zinc-600 dark:text-zinc-400">
                Last updated
              </th>
              <th className="px-4 py-3 text-left font-medium text-xs text-zinc-600 dark:text-zinc-400">
                Due date
              </th>
            </tr>
          </thead>
          <tbody>
            {challenges.map((challenge) => (
              <tr
                key={challenge.id}
                className="border-zinc-200 border-b transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
              >
                <td className="px-4 py-3">
                  <Link
                    to="/challenge/$challengeId"
                    params={{ challengeId: challenge.id.toString() }}
                    className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {challenge.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {challenge.owner ? `User ${challenge.owner}` : '--'}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {challenge.parent ? `Project ${challenge.parent}` : '--'}
                </td>
                <td className="px-4 py-3 text-center text-zinc-600 dark:text-zinc-400">
                  {challenge.completionPercentage ?? 0}%
                </td>
                <td className="px-4 py-3 text-center text-zinc-600 dark:text-zinc-400">--</td>
                <td className="px-4 py-3 text-center text-zinc-600 dark:text-zinc-400">--</td>
                <td className="px-4 py-3 text-center">
                  {challenge.featured ? (
                    <Badge
                      variant="secondary"
                      className="bg-orange-100 text-orange-800 text-xs dark:bg-orange-900 dark:text-orange-200"
                    >
                      URGENT
                    </Badge>
                  ) : (
                    <span className="text-zinc-600 dark:text-zinc-400">--</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge
                    variant="outline"
                    className={`${getDifficultyColor(challenge.difficulty)} text-xs`}
                  >
                    {getDifficultyLabel(challenge.difficulty)}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant="outline" className="text-xs">
                    {challenge.enabled ? 'Published' : 'Disabled'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {typeof challenge.location === 'string' ? challenge.location : '--'}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {formatDate(challenge.modified.toString())}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">--</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ScrollArea>
  )
}
