import { useQueryClient } from '@tanstack/react-query'
import { Code, Copy, Flag, Heart, MessageSquare, Star } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/api'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { useBrowsedChallengeContext } from '@/contexts/browseChallenge/BrowsedChallengeContext'
import { ChallengeComments } from '../ChallengeComments'
import { CloneChallengeModal } from '../CloneChallengeModal'
import { ReportModal } from '../ReportModal'
import { useIssueCheck } from './useIssueCheck'

export const ChallengeActionButtons = () => {
  const { challenge, user, isFavorited, isLiked, hasOverpass, canClone, projectId } =
    useBrowsedChallengeContext()

  const { existingIssue, isCheckingIssue, checkForIssue } = useIssueCheck()
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

  const ownerId =
    typeof challenge.owner === 'object' && challenge.owner !== null
      ? (challenge.owner as { id?: number; osmProfile?: { id?: number } })?.id ||
        (challenge.owner as { osmProfile?: { id?: number } })?.osmProfile?.id
      : typeof challenge.owner === 'number'
        ? challenge.owner
        : undefined

  return (
    <>
      <div className="mb-4 grid grid-cols-3 gap-2">
        <Button
          variant={isFavorited ? 'default' : 'outline'}
          size="sm"
          className="gap-2 transition-all hover:scale-105"
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
          className="gap-2 transition-all hover:scale-105"
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
            className={`gap-2 transition-all hover:scale-105 ${
              existingIssue
                ? 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:text-white dark:hover:bg-red-800'
                : ''
            }`}
            onClick={handleReport}
            disabled={isCheckingIssue}
            title={existingIssue ? 'View GitHub issue' : 'Report challenge'}
          >
            <Flag className={`size-4 transition-all ${existingIssue ? 'fill-current' : ''}`} />
            {existingIssue ? 'Reported' : 'Report'}
          </Button>
        )}
        {!!user && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 transition-all hover:scale-105"
            onClick={() => setIsCommentsModalOpen(true)}
          >
            <MessageSquare className="size-4" />
            <span>Comments</span>
          </Button>
        )}
        {hasOverpass && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 transition-all hover:scale-105"
            onClick={() => setIsOverpassModalOpen(true)}
          >
            <Code className="size-4" />
            <span>Overpass</span>
          </Button>
        )}
        {canClone && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 transition-all hover:scale-105"
            onClick={() => setIsCloneModalOpen(true)}
          >
            <Copy className="size-4" />
            <span>Clone</span>
          </Button>
        )}
      </div>

      {existingIssue && (
        <p className="text-red-600 text-xs dark:text-red-400">
          This challenge has been reported. Click the Reported button to view the issue.
        </p>
      )}

      {user && (
        <ReportModal
          open={isReportModalOpen}
          onOpenChange={setIsReportModalOpen}
          challenge={challenge}
          onSuccess={handleReportSuccess}
        />
      )}

      {user && challenge.id && (
        <Dialog open={isCommentsModalOpen} onOpenChange={setIsCommentsModalOpen}>
          <DialogContent className="flex h-[80vh] max-w-2xl flex-col">
            <DialogHeader>
              <DialogTitle>Challenge Comments</DialogTitle>
            </DialogHeader>
            <div className="flex min-h-0 flex-1 flex-col">
              <ChallengeComments challengeId={challenge.id} ownerId={ownerId} />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {hasOverpass && (
        <Dialog open={isOverpassModalOpen} onOpenChange={setIsOverpassModalOpen}>
          <DialogContent className="flex max-h-[80vh] max-w-4xl flex-col">
            <DialogHeader>
              <DialogTitle>Overpass Query</DialogTitle>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                  <textarea
                    readOnly
                    value={(challenge as { overpassQL?: string | null }).overpassQL || ''}
                    className="h-full w-full resize-none rounded-lg border-0 bg-transparent p-4 font-mono text-sm text-zinc-900 focus:outline-none dark:text-zinc-50"
                    style={{ minHeight: '400px' }}
                  />
                </div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {canClone && (
        <CloneChallengeModal
          open={isCloneModalOpen}
          onOpenChange={setIsCloneModalOpen}
          challengeId={challenge.id}
          challengeName={challenge.name}
          currentProjectId={projectId}
        />
      )}
    </>
  )
}
