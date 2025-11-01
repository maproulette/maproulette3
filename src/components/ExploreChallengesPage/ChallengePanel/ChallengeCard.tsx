import { Link } from '@tanstack/react-router'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemHeader,
  ItemTitle,
} from '@/components/ui/item'
import { Progress } from '@/components/ui/progress'
import type { Challenge } from '@/types/Challenge'
import { getDifficultyColor, getDifficultyLabel } from '@/utils/difficultyLevelData'

export const ChallengeCard = ({ challenge }: { challenge: Challenge }) => {
  return (
    <Item variant="outline" className="overflow-hidden">
      <Link
        to="/challenges/$challengeId"
        params={{ challengeId: challenge.id.toString() }}
        className="block w-full min-w-0 cursor-pointer transition-shadow hover:shadow-sm"
      >
        <ItemHeader className="min-w-0">
          <ItemContent className="min-w-0">
            <ItemTitle className="w-full max-w-full">
              {challenge.featured && (
                <Badge
                  variant="secondary"
                  className="shrink-0 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  POPULAR
                </Badge>
              )}
              <span className="min-w-0 truncate">{challenge.name}</span>
            </ItemTitle>
            <ItemDescription className="line-clamp-1">
              {challenge.parent ? `Project: ${challenge.parent}` : 'Independent Challenge'}
            </ItemDescription>
          </ItemContent>
          <ItemActions className="shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              onClick={(e) => e.preventDefault()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </ItemActions>
        </ItemHeader>

        <ItemFooter>
          <div className="flex w-full min-w-0 flex-col gap-2">
            <div className="flex items-center justify-between gap-2 text-xs">
              <Badge variant="outline" className={`${getDifficultyColor(challenge.difficulty)} `}>
                {getDifficultyLabel(challenge.difficulty)}
              </Badge>
              <span className="text-zinc-600 dark:text-zinc-400">
                {challenge.completionPercentage || 0}%
              </span>
            </div>
            <Progress
              value={challenge.completionPercentage || 0}
              className="w-full bg-zinc-200 dark:bg-zinc-700 [&>*]:bg-blue-500"
            />
          </div>
        </ItemFooter>
      </Link>
    </Item>
  )
}
