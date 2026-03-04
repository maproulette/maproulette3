import { ChevronDown } from 'lucide-react'

interface ScrollIndicatorProps {
  hasMoreToScroll?: boolean
}

export const ScrollIndicator = ({ hasMoreToScroll }: ScrollIndicatorProps) => {
  if (!hasMoreToScroll) return null

  return (
    <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 flex items-end justify-center pt-6 pb-2">
      <div className="flex flex-col items-center gap-1">
        <ChevronDown className="size-3.5 animate-bounce text-zinc-400 dark:text-zinc-500" />
        <span className="text-xs text-zinc-500 dark:text-zinc-400">Scroll for more</span>
      </div>
    </div>
  )
}
