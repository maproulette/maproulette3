import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
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
import { toast } from 'sonner'
import { api } from '@/api'
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
  const [isLoadingTask, setIsLoadingTask] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const handleStartTask = async () => {
    if (!challenge.id) return

    try {
      setIsLoadingTask(true)
      const tasks = await queryClient.fetchQuery(api.challenge.getRandomTask(challenge.id))

      if (tasks && tasks.length > 0) {
        const taskId = tasks[0].id
        await navigate({ to: '/tasks/$taskId', params: { taskId: String(taskId) } })
      } else {
        // No tasks available
        toast.error('No tasks available for this challenge')
      }
    } catch (error) {
      console.error('Error starting task:', error)
      toast.error('Failed to load task')
    } finally {
      setIsLoadingTask(false)
    }
  }

  const handleFavorite = () => {
    setIsFavorited(!isFavorited)
    toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites')
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    toast.success(isLiked ? 'Like removed' : 'Challenge liked!')
  }

  const handleReport = () => {
    toast.info('Report feature coming soon')
  }

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
          <Button
            variant={isFavorited ? 'default' : 'outline'}
            size="sm"
            className="gap-2"
            onClick={handleFavorite}
          >
            <Star className={`size-4 ${isFavorited ? 'fill-current' : ''}`} />
            {isFavorited ? 'Favorited' : 'Favorite'}
          </Button>
          <Button
            variant={isLiked ? 'default' : 'outline'}
            size="sm"
            className="gap-2"
            onClick={handleLike}
          >
            <Heart className={`size-4 ${isLiked ? 'fill-current' : ''}`} />
            {isLiked ? 'Liked' : 'Like'}
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleReport}>
            <Flag className="size-4" />
            Report
          </Button>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            className="w-full gap-2"
            onClick={handleStartTask}
            disabled={isLoadingTask}
          >
            <Play className="size-5" />
            {isLoadingTask ? 'Loading...' : 'Start Task'}
          </Button>
          <Button variant="outline" size="lg" className="w-full gap-2" asChild>
            <Link
              to="/manage/challenge/$challengeId"
              params={{ challengeId: String(challenge.id) }}
            >
              <Settings className="size-5" />
              Manage Challenge
            </Link>
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
