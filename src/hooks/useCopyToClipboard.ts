import { useCallback, useState } from 'react'
import { logger } from '@/lib/logger'

export const useCopyToClipboard = () => {
  const [isCopied, setIsCopied] = useState(false)

  // Reason: stable reference returned from hook — consumers use it as event handler dependency
  const copy = useCallback(async (text: string): Promise<void> => {
    if (!navigator?.clipboard) {
      logger.warn('Clipboard not supported')
      return
    }

    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      logger.warn('Copy failed', { error })
      setIsCopied(false)
    }
  }, [])

  return { copy, isCopied }
}
