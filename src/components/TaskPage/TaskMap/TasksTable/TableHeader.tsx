import { ChevronDown, ChevronUp, Maximize2, Minimize2, Package } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface TableHeaderProps {
  isExpanded: boolean
  isMaximized: boolean
  isLoading: boolean
  taskCount: number
  startIndex: number
  endIndex: number
  selectedCount: number
  onToggleExpand: () => void
  onToggleMaximize: () => void
  onCreateBundle?: () => void
}

export const TableHeader = ({
  isExpanded,
  isMaximized,
  isLoading,
  taskCount,
  startIndex,
  endIndex,
  selectedCount,
  onToggleExpand,
  onToggleMaximize,
  onCreateBundle,
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
        {selectedCount > 0 && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 font-medium text-blue-700 text-xs dark:bg-blue-900/30 dark:text-blue-300">
            {selectedCount} selected
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {selectedCount > 1 && onCreateBundle && (
          <Button
            variant="default"
            size="sm"
            className="h-8 gap-2"
            onClick={onCreateBundle}
            title="Create bundle from selected tasks"
          >
            <Package className="h-4 w-4" />
            Bundle Tasks
          </Button>
        )}
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
    </div>
  )
}
