import { useQueryClient } from '@tanstack/react-query'
import { Code, Copy, Flag, Heart, MessageSquare, Star } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/api'
import { Button } from '@/components/ui/Button'
import { useBrowsedChallengeContext } from '@/contexts/browseChallenge/BrowsedChallengeContext'
import { ChallengeModals } from './ChallengeModals'

export const ChallengeActionButtons = () => {
  const {
    challenge,
    user,
    isFavorited,
    isLiked,
    hasOverpass,
    canClone,
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
      <div className="mb-4 grid grid-cols-3 gap-2">
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
        {!!user && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setIsCommentsModalOpen(true)}
          >
            <MessageSquare className="size-3.5" />
            Comments
          </Button>
        )}
        {hasOverpass && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setIsOverpassModalOpen(true)}
          >
            <Code className="size-3.5" />
            Overpass
          </Button>
        )}
        {canClone && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setIsCloneModalOpen(true)}
          >
            <Copy className="size-3.5" />
            Clone
          </Button>
        )}
      </div>

      {existingIssue && (
        <p className="text-red-600 text-xs dark:text-red-400">
          This challenge has been reported. Click the Reported button to view the issue.
        </p>
      )}

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
