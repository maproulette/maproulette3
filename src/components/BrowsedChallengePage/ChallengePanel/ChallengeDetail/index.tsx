import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/api'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { useMapToggle } from '../../index'
import { ChallengeActionButtons } from './ChallengeActionButtons'
import { ChallengeDescription } from './ChallengeDescription'
import { ChallengeFooter } from './ChallengeFooter'
import { ChallengeHeader } from './ChallengeHeader'
import { ChallengeModals } from './ChallengeModals'
import { ScrollIndicator } from './ScrollIndicator'
import { useChallengeData } from './useChallengeData'
import { useIssueCheck } from './useIssueCheck'
import { useScrollIndicator } from './useScrollIndicator'

export const ChallengeDetail = () => {
  const {
    challenge,
    user,
    isFavorited,
    isLiked,
    canClone,
    projectId,
    projectName,
    ownerName,
    formattedDate,
    hasOverpass,
  } = useChallengeData()

  const { existingIssue, isCheckingIssue, checkForIssue } = useIssueCheck()
  const { hasMoreToScroll, scrollAreaRef } = useScrollIndicator()
  const { showMap, setShowMap } = useMapToggle()

  const [isLoadingTask, setIsLoadingTask] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false)
  const [isOverpassModalOpen, setIsOverpassModalOpen] = useState(false)
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false)

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
        toast.error('No tasks available for this challenge')
      }
    } catch (error) {
      console.error('Error starting task:', error)
      toast.error('Failed to load task')
    } finally {
      setIsLoadingTask(false)
    }
  }

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
    <div className="flex h-full flex-col overflow-hidden">
      <div className="relative min-h-0 flex-1">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="flex flex-col p-6">
            <ChallengeHeader
              name={challenge.name || ''}
              projectName={projectName}
              ownerName={ownerName}
              formattedDate={formattedDate}
            />

            <ChallengeActionButtons
              isFavorited={isFavorited}
              isLiked={isLiked}
              existingIssue={existingIssue}
              isCheckingIssue={isCheckingIssue}
              hasOverpass={hasOverpass}
              canClone={canClone}
              user={user}
              onFavorite={handleFavorite}
              onLike={handleLike}
              onReport={handleReport}
              onComments={() => setIsCommentsModalOpen(true)}
              onOverpass={() => setIsOverpassModalOpen(true)}
              onClone={() => setIsCloneModalOpen(true)}
            />

            {existingIssue && (
              <p className="mb-4 text-red-600 text-xs dark:text-red-400">
                This challenge has been reported. Click the Reported button to view the issue.
              </p>
            )}

            <ChallengeDescription description={challenge.description} blurb={challenge.blurb} />
          </div>
        </ScrollArea>

        <ScrollIndicator hasMoreToScroll={hasMoreToScroll} />
      </div>

      <ChallengeFooter
        challengeId={challenge.id}
        completionPercentage={challenge.completionPercentage}
        isLoadingTask={isLoadingTask}
        showMap={showMap}
        onStartTask={handleStartTask}
        onToggleMap={() => setShowMap(!showMap)}
      />

      <ChallengeModals
        user={user}
        challenge={challenge}
        projectId={projectId}
        existingIssue={existingIssue}
        isReportModalOpen={isReportModalOpen}
        isCommentsModalOpen={isCommentsModalOpen}
        isOverpassModalOpen={isOverpassModalOpen}
        isCloneModalOpen={isCloneModalOpen}
        canClone={canClone}
        hasOverpass={hasOverpass}
        onReportModalChange={setIsReportModalOpen}
        onCommentsModalChange={setIsCommentsModalOpen}
        onOverpassModalChange={setIsOverpassModalOpen}
        onCloneModalChange={setIsCloneModalOpen}
        onReportSuccess={handleReportSuccess}
      />
    </div>
  )
}
