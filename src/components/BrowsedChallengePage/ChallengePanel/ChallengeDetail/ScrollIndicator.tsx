import { ChevronDown } from 'lucide-react'

interface ScrollIndicatorProps {
  hasMoreToScroll?: boolean
}

export const ScrollIndicator = ({ hasMoreToScroll }: ScrollIndicatorProps) => {
  if (!hasMoreToScroll) return null

  return (
    <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 flex items-end justify-center bg-gradient-to-t from-zinc-50 via-zinc-50/80 to-transparent pt-8 pb-2 dark:from-zinc-950 dark:via-zinc-950/80">
      <div className="flex flex-col items-center gap-1">
        <ChevronDown className="size-4 animate-bounce text-zinc-500 dark:text-zinc-400" />
        <span className="font-medium text-xs text-zinc-500 dark:text-zinc-400">
          Scroll for more
        </span>
      </div>
    </div>
  )
}
