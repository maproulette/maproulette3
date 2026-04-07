import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/Badge'
import { ScrollArea } from '@/components/ui/ScrollArea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { getDifficultyColor, getDifficultyLabel } from '@/lib/difficultyLevelData'
import { formatDate } from '@/lib/formatDate'
import { useChallengeResultsContext } from '../contexts/ChallengeResultsContext'

export const ChallengesTableView = () => {
  const { challenges } = useChallengeResultsContext()
  return (
    <ScrollArea className="h-full w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Organisation</TableHead>
            <TableHead className="text-center">Percent mapped</TableHead>
            <TableHead className="text-center">Percent validated</TableHead>
            <TableHead className="text-center">Contributors</TableHead>
            <TableHead className="text-center">Priority</TableHead>
            <TableHead className="text-center">Difficulty</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Last updated</TableHead>
            <TableHead>Due date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {challenges.map((challenge) => (
            <TableRow key={challenge.id}>
              <TableCell>
                <Link
                  to="/challenge/$challengeId"
                  params={{ challengeId: challenge.id.toString() }}
                  className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  {challenge.name}
                </Link>
              </TableCell>
              <TableCell className="text-zinc-600 dark:text-slate-400">
                {challenge.owner ? `User ${challenge.owner}` : '--'}
              </TableCell>
              <TableCell className="text-zinc-600 dark:text-slate-400">
                {challenge.parent ? `Project ${challenge.parent}` : '--'}
              </TableCell>
              <TableCell className="text-center text-zinc-600 dark:text-slate-400">
                {challenge.completionPercentage ?? 0}%
              </TableCell>
              <TableCell className="text-center text-zinc-600 dark:text-slate-400">--</TableCell>
              <TableCell className="text-center text-zinc-600 dark:text-slate-400">--</TableCell>
              <TableCell className="text-center">
                {challenge.featured ? (
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-800 text-xs dark:bg-orange-900 dark:text-orange-200"
                  >
                    URGENT
                  </Badge>
                ) : (
                  <span className="text-zinc-600 dark:text-slate-400">--</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant="outline"
                  className={`${getDifficultyColor(challenge.difficulty)} text-xs`}
                >
                  {getDifficultyLabel(challenge.difficulty)}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline" className="text-xs">
                  {challenge.enabled ? 'Published' : 'Disabled'}
                </Badge>
              </TableCell>
              <TableCell className="text-zinc-600 dark:text-slate-400">
                {typeof challenge.location === 'string' ? challenge.location : '--'}
              </TableCell>
              <TableCell className="text-zinc-600 dark:text-slate-400">
                {formatDate(challenge.modified)}
              </TableCell>
              <TableCell className="text-zinc-600 dark:text-slate-400">--</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  )
}
