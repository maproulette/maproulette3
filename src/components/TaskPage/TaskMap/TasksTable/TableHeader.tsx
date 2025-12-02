import { Maximize2, Minimize2, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface TableHeaderProps {
  isExpanded: boolean
  isMaximized: boolean
  isLoading: boolean
  taskCount: number
  startIndex: number
  endIndex: number
  onToggleExpand: () => void
  onToggleMaximize: () => void
}

export const TableHeader = ({
  isExpanded,
  isMaximized,
  isLoading,
  taskCount,
  startIndex,
  endIndex,
  onToggleExpand,
  onToggleMaximize,
}: TableHeaderProps) => {
  return (
    <div className="flex items-center justify-between border-zinc-200 border-b bg-zinc-50 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-3">
        <h3 className="font-semibold text-sm">Visible Tasks</h3>
        <span className="rounded-full bg-zinc-200 px-2 py-0.5 font-medium text-xs dark:bg-zinc-800">
          {isLoading
            ? 'Loading...'
            : taskCount > 0
              ? `${startIndex}-${endIndex} of ${taskCount}`
              : '0 tasks'}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onToggleMaximize}
          title={isMaximized ? 'Restore' : 'Maximize'}
        >
          {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onToggleExpand}
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}

