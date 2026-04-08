import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { cn } from '@/lib/utils'
import { ChallengeDescription } from './ChallengeDescription'
import { ChallengeFooter } from './ChallengeFooter'
import { ChallengeHeader } from './ChallengeHeader'
import { ChallengeModals } from './ChallengeModals'
import { ChallengeModalsProvider } from './ChallengeModals/ChallengeModalsContext'
import { ScrollIndicator } from './ScrollIndicator'
import { useScrollIndicator } from './useScrollIndicator'

export const ChallengePanel = () => {
  const { hasMoreToScroll, scrollAreaRef } = useScrollIndicator()

  const [isScrolled, setIsScrolled] = useState(false)

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

  return (
    <ChallengeModalsProvider>
      <div className="flex w-full flex-col overflow-hidden md:h-full">
        <div className="flex h-full flex-col overflow-hidden">
          <div className="relative flex min-h-0 flex-1 flex-col">
            <div
              className={cn(
                'sticky top-0 z-10 w-full shrink-0 rounded-t-xl border-b backdrop-blur-md transition-all duration-500 ease-in-out',
                isScrolled
                  ? 'border-zinc-200/60 bg-white/95 shadow-md dark:border-slate-700/60 dark:bg-slate-800/95'
                  : 'border-zinc-200/40 bg-white shadow-sm dark:border-slate-700/40 dark:bg-slate-800'
              )}
            >
              <div
                className={cn(
                  'relative flex w-full min-w-0 border-0 bg-transparent px-6 text-left transition-all duration-500 ease-in-out',
                  isScrolled ? 'items-center py-3' : 'flex-col items-start pt-6 pb-4'
                )}
              >
                {isScrolled && (
                  <Button
                    variant="ghost"
                    className="absolute inset-0 z-0 h-auto cursor-pointer rounded-none border-0 bg-transparent hover:bg-background/50"
                    onClick={scrollToTop}
                    aria-label="Scroll to top"
                  />
                )}
                <ChallengeHeader isScrolled={isScrolled} />
              </div>
            </div>

            <div className="relative min-h-0 flex-1">
              <ScrollArea ref={scrollAreaRef} className="h-full">
                <div className="flex flex-col px-6 py-4">
                  <ChallengeDescription />
                </div>
              </ScrollArea>

              <ScrollIndicator hasMoreToScroll={hasMoreToScroll} />
            </div>
          </div>

          <ChallengeFooter />
        </div>
      </div>

      <ChallengeModals />
    </ChallengeModalsProvider>
  )
}
