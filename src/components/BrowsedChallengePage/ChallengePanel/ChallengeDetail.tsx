import {
  ChevronDown,
  ChevronUp,
  Flag,
  Heart,
  Map as MapIcon,
  Play,
  Settings,
  Star,
} from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Separator } from '@/components/ui/Separator'
import { useBrowsedChallengeContext } from '@/contexts/browseChallenge/BrowsedChallengeContext'
import { getDifficultyColor, getDifficultyLabel } from '@/utils/difficultyLevelData'
import { useMapToggle } from '../index'

export const ChallengeDetail = () => {
  const { challenge } = useBrowsedChallengeContext()
  const { showMap, setShowMap } = useMapToggle()
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-6 p-6">
          {/* Challenge Name */}
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-4">
              <h1 className="line-clamp-2 font-bold text-xl text-zinc-900 dark:text-zinc-50">
                {challenge.name}
              </h1>
              {challenge.featured && (
                <Badge
                  variant="secondary"
                  className="shrink-0 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  POPULAR
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Project, Creator, and Difficulty */}
          <div className="grid grid-cols-3 gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="font-semibold text-xs text-zinc-500 uppercase tracking-wide dark:text-zinc-500">
                Project
              </span>
              <span className="font-medium text-sm text-zinc-900 dark:text-zinc-50">
                {challenge.parent || 'Independent Challenge'}
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="font-semibold text-xs text-zinc-500 uppercase tracking-wide dark:text-zinc-500">
                Creator
              </span>
              <span className="font-medium text-sm text-zinc-900 dark:text-zinc-50">
                {challenge.owner || 'Unknown'}
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="font-semibold text-xs text-zinc-500 uppercase tracking-wide dark:text-zinc-500">
                Difficulty
              </span>
              <Badge variant="outline" className={getDifficultyColor(challenge.difficulty)}>
                {getDifficultyLabel(challenge.difficulty)}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div className="flex flex-col gap-2">
            <h2 className="font-semibold text-lg text-zinc-900 dark:text-zinc-50">Description</h2>
            <div className="relative">
              <div
                className={`text-sm text-zinc-600 leading-relaxed transition-all dark:text-zinc-400 ${
                  isDescriptionExpanded ? '' : 'max-h-24 overflow-hidden'
                }`}
              >
                <p>{challenge.description || 'No description available.'}</p>
                {challenge.blurb && (
                  <p className="mt-2 text-zinc-500 italic dark:text-zinc-500">{challenge.blurb}</p>
                )}
              </div>
              {(challenge.description || challenge.blurb) && (
                <button
                  type="button"
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="mt-2 flex items-center gap-1 font-medium text-blue-600 text-xs hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {isDescriptionExpanded ? (
                    <>
                      Show less <ChevronUp className="size-3" />
                    </>
                  ) : (
                    <>
                      Show more <ChevronDown className="size-3" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          {/* Completion Progress */}
          {challenge.completionPercentage !== undefined && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-600 dark:text-zinc-400">Progress</span>
                <span className="text-zinc-900 dark:text-zinc-50">
                  {challenge.completionPercentage}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${challenge.completionPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Sticky Bottom Section */}
      <div className="border-zinc-200 border-t bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        {/* Action Buttons Row */}
        <div className="mb-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Star className="size-4" />
            Favorite
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Heart className="size-4" />
            Like
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Flag className="size-4" />
            Report
          </Button>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col gap-3">
          <Button size="lg" className="w-full gap-2">
            <Play className="size-5" />
            Start Task
          </Button>
          <Button variant="outline" size="lg" className="w-full gap-2">
            <Settings className="size-5" />
            Manage Challenge
          </Button>
        </div>

        <div className="mt-4 md:hidden">
          <Button
            onClick={() => setShowMap(!showMap)}
            variant="outline"
            size="lg"
            className="w-full gap-2"
          >
            <MapIcon className="size-5" />
            {showMap ? 'Hide Map' : 'Show Map'}
          </Button>
        </div>
      </div>
    </div>
  )
}
