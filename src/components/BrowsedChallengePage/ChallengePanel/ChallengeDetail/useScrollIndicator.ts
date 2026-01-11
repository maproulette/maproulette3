import { useEffect, useRef, useState } from 'react'
import { useBrowsedChallengeContext } from '@/contexts/browseChallenge/BrowsedChallengeContext'

export const useScrollIndicator = () => {
  const { challenge } = useBrowsedChallengeContext()
  const [hasMoreToScroll, setHasMoreToScroll] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkScrollPosition = () => {
      if (!scrollAreaRef.current) return

      const viewport = scrollAreaRef.current.querySelector(
        '[data-slot="scroll-area-viewport"]'
      ) as HTMLElement
      if (!viewport) return

      const { scrollTop, scrollHeight, clientHeight } = viewport

      const hasMore = scrollHeight - scrollTop - clientHeight > 10
      setHasMoreToScroll(hasMore)
    }

    checkScrollPosition()
    const timeoutId = setTimeout(checkScrollPosition, 100)

    const viewport = scrollAreaRef.current?.querySelector(
      '[data-slot="scroll-area-viewport"]'
    ) as HTMLElement
    if (viewport) {
      viewport.addEventListener('scroll', checkScrollPosition)
      window.addEventListener('resize', checkScrollPosition)
    }

    return () => {
      clearTimeout(timeoutId)
      if (viewport) {
        viewport.removeEventListener('scroll', checkScrollPosition)
        window.removeEventListener('resize', checkScrollPosition)
      }
    }
  }, [challenge.description, challenge.blurb])

  return {
    hasMoreToScroll,
    scrollAreaRef,
  }
}
