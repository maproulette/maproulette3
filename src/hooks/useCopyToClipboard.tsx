import { useCallback, useState } from 'react'

export type UseCopyToClipboardReturn = { copy: (text: string) => Promise<void>; isCopied: boolean }

export const useCopyToClipboard = (): UseCopyToClipboardReturn => {
  const [isCopied, setIsCopied] = useState(false)

  const copy = useCallback(async (text: string): Promise<void> => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported')
      return
    }

    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)

      // Reset the copied state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.warn('Copy failed', error)
      setIsCopied(false)
    }
  }, [])

  return { copy, isCopied }
}
