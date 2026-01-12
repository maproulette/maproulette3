import { useQueryClient } from '@tanstack/react-query'
import { Flag, Heart, Map as MapIcon, Play, Star } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/api'
import { Button } from '@/components/ui/Button'
import { useBrowsedChallengeContext } from '@/contexts/browseChallenge/BrowsedChallengeContext'
import { ChallengeProgress } from './ChallengeProgress'
import { ChallengeModals } from './ChallengeModals'

interface ChallengeFooterProps {
  completionPercentage?: number | null
  isLoadingTask: boolean
  showMap: boolean
  onStartTask: () => void
  onToggleMap: () => void
}

export const ChallengeFooter = ({
  completionPercentage,
  isLoadingTask,
  showMap,
  onStartTask,
  onToggleMap,
}: ChallengeFooterProps) => {
  const {
    challenge,
    user,
    isFavorited,
    isLiked,
    existingIssue,
    isCheckingIssue,
    checkForIssue,
  } = useBrowsedChallengeContext()
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false)
  const [isOverpassModalOpen, setIsOverpassModalOpen] = useState(false)
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false)

  const queryClient = useQueryClient()

  const handleFavorite = async () => {
    if (!challenge.id) return

    try {
      if (isFavorited) {
        await api.challenge.unfavoriteChallenge(challenge.id)
        toast.success('Removed from favorites')
      } else {
        await api.challenge.favoriteChallenge(challenge.id)
        toast.success('Added to favorites')
      }

      await queryClient.invalidateQueries({
        queryKey: ['challenge', challenge.id, 'isFavorited'],
      })
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Failed to update favorite status')
    }
  }

  const handleLike = async () => {
    if (!challenge.id) return

    try {
      if (isLiked) {
        await api.challenge.unlikeChallenge(challenge.id)
        toast.success('Like removed')
      } else {
        await api.challenge.likeChallenge(challenge.id)
        toast.success('Challenge liked!')
      }

      await queryClient.invalidateQueries({
        queryKey: ['challenge', challenge.id, 'isLiked'],
      })
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error('Failed to update like status')
    }
  }

  const handleReport = () => {
    if (existingIssue) {
      window.open(existingIssue.html_url, '_blank')
    } else {
      setIsReportModalOpen(true)
    }
  }

  const handleReportSuccess = () => {
    toast.success('Report submitted successfully')

    setTimeout(() => {
      checkForIssue()
    }, 3000)
  }

  return (
    <>
      <div className="border-zinc-200/50 border-t px-6 py-8 backdrop-blur-sm dark:border-zinc-800/50">
        <ChallengeProgress completionPercentage={completionPercentage ?? undefined} />

      

     
      <div className="my-4 grid grid-cols-3 gap-3">
          <Button
            variant={isFavorited ? 'default' : 'outline'}
            size="sm"
            className="gap-1.5"
            onClick={handleFavorite}
          >
            <Star
              className={`size-4 transition-all ${
                isFavorited ? 'fill-yellow-500 text-yellow-500' : ''
              }`}
            />
            {isFavorited ? 'Favorited' : 'Favorite'}
          </Button>
          <Button
            variant={isLiked ? 'default' : 'outline'}
            size="sm"
            className="gap-1.5"
            onClick={handleLike}
          >
            <Heart
              className={`size-4 transition-all ${isLiked ? 'fill-red-500 text-red-500' : ''}`}
            />
            {isLiked ? 'Liked' : 'Like'}
          </Button>
          {!!user && (
            <Button
              variant={existingIssue ? 'default' : 'outline'}
              size="sm"
              className={`gap-1.5 ${
                existingIssue
                  ? 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:text-white dark:hover:bg-red-800'
                  : ''
              }`}
              onClick={handleReport}
              disabled={isCheckingIssue}
              title={existingIssue ? 'View GitHub issue' : 'Report challenge'}
            >
              <Flag className="size-3.5" />
              {existingIssue ? 'Reported' : 'Report'}
            </Button>
          )}
        </div>

        {existingIssue && (
          <p className="mt-3 text-red-600 text-xs dark:text-red-400">
            This challenge has been reported. Click the Reported button to view the issue.
          </p>
        )}

<div className="flex flex-col gap-4 mt-4">
          <Button
            size="lg"
            className="w-full gap-2 bg-[#00a592] text-white shadow-md transition-all hover:bg-[#008f7d] hover:shadow-lg dark:bg-[#00a592] dark:hover:bg-[#008f7d]"
            onClick={onStartTask}
            disabled={isLoadingTask}
          >
            <Play className="size-5" />
            {isLoadingTask ? 'Loading...' : 'Start Task'}
          </Button>
        {/* <Button
          variant="outline"
          size="lg"
          className="w-full gap-2 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800"
          asChild
        >
          <Link to="/manage/challenge/$challengeId" params={{ challengeId: String(challengeId) }}>
            <Settings className="size-5" />
            Manage Challenge
          </Link>
        </Button> */}
      </div>
      <div className="mt-6 md:hidden">
        <Button
          onClick={onToggleMap}
          variant="outline"
          size="lg"
          className="w-full gap-2 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <MapIcon className="size-5" />
          {showMap ? 'Hide Map' : 'Show Map'}
        </Button>
      </div>
    </div>

    <ChallengeModals
      isReportModalOpen={isReportModalOpen}
      isCommentsModalOpen={isCommentsModalOpen}
      isOverpassModalOpen={isOverpassModalOpen}
      isCloneModalOpen={isCloneModalOpen}
      onReportModalChange={setIsReportModalOpen}
      onCommentsModalChange={setIsCommentsModalOpen}
      onOverpassModalChange={setIsOverpassModalOpen}
      onCloneModalChange={setIsCloneModalOpen}
      onReportSuccess={handleReportSuccess}
    />
  </>
  )
}
