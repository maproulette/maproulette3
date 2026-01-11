import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
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
  const [isScrolled, setIsScrolled] = useState(false)

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  useEffect(() => {
    const checkScrollPosition = () => {
      if (!scrollAreaRef.current) return

      const viewportElement = scrollAreaRef.current.querySelector(
        '[data-slot="scroll-area-viewport"]'
      )
      if (!viewportElement || !(viewportElement instanceof HTMLElement)) return

      const viewport = viewportElement
      const scrollTop = viewport.scrollTop
      setIsScrolled(scrollTop > 20)
    }

    const viewportElement = scrollAreaRef.current?.querySelector(
      '[data-slot="scroll-area-viewport"]'
    )
    const viewport = viewportElement instanceof HTMLElement ? viewportElement : null
    if (viewport) {
      viewport.addEventListener('scroll', checkScrollPosition)
      checkScrollPosition()
    }

    return () => {
      if (viewport) {
        viewport.removeEventListener('scroll', checkScrollPosition)
      }
    }
  }, [scrollAreaRef])

  const scrollToTop = () => {
    if (!scrollAreaRef.current) return

    const viewportElement = scrollAreaRef.current.querySelector(
      '[data-slot="scroll-area-viewport"]'
    )
    if (viewportElement && viewportElement instanceof HTMLElement) {
      viewportElement.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }

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
      <div className="relative min-h-0 flex-1 flex-col flex">
        {/* Sticky Header Section */}
        <div
          className={`sticky top-0 z-10 w-full bg-background/98 backdrop-blur-md border-b shrink-0 transition-all duration-500 ease-in-out ${
            isScrolled
              ? 'shadow-md border-zinc-200/60 dark:border-zinc-700/60'
              : 'shadow-sm border-zinc-200/40 dark:border-zinc-800/40'
          }`}
        >
          <div
            className={`flex w-full px-6 transition-all duration-500 ease-in-out min-w-0 ${
              isScrolled
                ? 'items-center py-3 cursor-pointer hover:bg-background/90'
                : 'flex-col pt-8 pb-4'
            }`}
            onClick={() => {
              // Only scroll to top when scrolled
              if (isScrolled) {
                scrollToTop()
              }
            }}
          >
            <ChallengeHeader
              name={challenge.name || ''}
              projectName={projectName}
              ownerName={ownerName}
              formattedDate={formattedDate}
              isScrolled={isScrolled}
            />

            {!isScrolled && (
              <div
                className="overflow-hidden transition-all duration-500 ease-in-out max-h-96 opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <ChallengeActionButtons isScrolled={isScrolled} />
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="relative min-h-0 flex-1">
          <ScrollArea ref={scrollAreaRef} className="h-full">
            <div className="flex flex-col px-6 py-4">
              <ChallengeDescription description={challenge.description} blurb={challenge.blurb} />
            </div>
          </ScrollArea>

          <ScrollIndicator hasMoreToScroll={hasMoreToScroll} />
        </div>
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
