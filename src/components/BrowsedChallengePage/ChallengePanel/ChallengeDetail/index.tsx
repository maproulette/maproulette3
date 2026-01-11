import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/api'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { useBrowsedChallengeContext } from '@/contexts/browseChallenge/BrowsedChallengeContext'
import { useMapToggle } from '../../index'
import { ChallengeActionButtons } from './ChallengeActionButtons'
import { ChallengeDescription } from './ChallengeDescription'
import { ChallengeFooter } from './ChallengeFooter'
import { ChallengeHeader } from './ChallengeHeader'
import { ScrollIndicator } from './ScrollIndicator'
import { useScrollIndicator } from './useScrollIndicator'

export const ChallengeDetail = () => {
  const { challenge, projectName, ownerName, formattedDate } = useBrowsedChallengeContext()

  const { hasMoreToScroll, scrollAreaRef } = useScrollIndicator()
  const { showMap, setShowMap } = useMapToggle()

  const [isLoadingTask, setIsLoadingTask] = useState(false)

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

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="relative min-h-0 flex-1">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="flex flex-col p-4">
            <ChallengeHeader
              name={challenge.name || ''}
              projectName={projectName}
              ownerName={ownerName}
              formattedDate={formattedDate}
            />

            <ChallengeActionButtons />

            <ChallengeDescription description={challenge.description} blurb={challenge.blurb} />
          </div>
        </ScrollArea>

        <ScrollIndicator hasMoreToScroll={hasMoreToScroll} />
      </div>

      <ChallengeFooter
        completionPercentage={challenge.completionPercentage}
        isLoadingTask={isLoadingTask}
        showMap={showMap}
        onStartTask={handleStartTask}
        onToggleMap={() => setShowMap(!showMap)}
      />
    </div>
  )
}
