import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/api'
import { useBrowsedChallengeContext } from '@/components/BrowsedChallengePage/contexts/BrowsedChallengeContext'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { useMapToggle } from '../index'
import { ChallengeDescription } from './ChallengeDescription'
import { ChallengeFooter } from './ChallengeFooter'
import { ChallengeHeader } from './ChallengeHeader'
import { ScrollIndicator } from './ScrollIndicator'
import { useScrollIndicator } from './useScrollIndicator'

export const ChallengePanel = () => {
  const queryClient = useQueryClient()
  const { challenge, projectName, ownerName, formattedDate } = useBrowsedChallengeContext()

  const { hasMoreToScroll, scrollAreaRef } = useScrollIndicator()
  const { showMap, setShowMap } = useMapToggle()

  const [isLoadingTask, setIsLoadingTask] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const navigate = useNavigate()

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
      const task = await api.challenge.getRandomTask(challenge.id, queryClient)

      if (task && task.length > 0) {
        const taskId = task[0].id
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
    <div className="flex w-full flex-col overflow-hidden bg-white shadow-sm md:h-full md:rounded-2xl md:rounded-r-none md:rounded-l-2xl dark:bg-zinc-950 dark:shadow-none">
      <div className="flex h-full flex-col overflow-hidden">
        <div className="relative flex min-h-0 flex-1 flex-col">
          {/* Sticky Header Section */}
          <div
            className={`sticky top-0 z-10 w-full shrink-0 border-b backdrop-blur-md transition-all duration-500 ease-in-out ${
              isScrolled
                ? 'border-zinc-200/60 bg-white/98 shadow-md dark:border-zinc-800/60 dark:bg-zinc-950/98'
                : 'border-zinc-200/40 bg-white/95 shadow-sm dark:border-zinc-800/40 dark:bg-zinc-950/95'
            }`}
          >
            <div
              className={`relative flex w-full min-w-0 border-0 bg-transparent px-6 text-left transition-all duration-500 ease-in-out ${
                isScrolled ? 'items-center py-3' : 'flex-col items-start pt-8 pb-4'
              }`}
            >
              {/* Invisible button overlay for scroll-to-top when scrolled */}
              {isScrolled && (
                <button
                  type="button"
                  className="absolute inset-0 z-0 cursor-pointer border-0 bg-transparent hover:bg-background/50"
                  onClick={scrollToTop}
                  aria-label="Scroll to top"
                />
              )}
              <ChallengeHeader
                name={challenge.name || ''}
                projectName={projectName}
                ownerName={ownerName}
                formattedDate={formattedDate}
                isScrolled={isScrolled}
              />
            </div>
          </div>

          <div className="relative min-h-0 flex-1 bg-zinc-50 dark:bg-zinc-900">
            <ScrollArea ref={scrollAreaRef} className="h-full">
              <div className="flex flex-col px-6 py-4">
                <ChallengeDescription description={challenge.description} blurb={challenge.blurb} />
              </div>
            </ScrollArea>

            <ScrollIndicator hasMoreToScroll={hasMoreToScroll} />
          </div>
        </div>

        <ChallengeFooter
          isLoadingTask={isLoadingTask}
          showMap={showMap}
          onStartTask={handleStartTask}
          onToggleMap={() => setShowMap(!showMap)}
        />
      </div>
    </div>
  )
}
