import { Package } from 'lucide-react'

interface BundleTaskListProps {
  taskIds: number[]
  onOpenBundleTask?: (taskId: number) => void
}

export const BundleTaskList = ({ taskIds, onOpenBundleTask }: BundleTaskListProps) => {
  if (taskIds.length === 0) return null

  return (
    <div>
      <div className="flex items-center gap-2 pb-2">
        <Package className="h-3.5 w-3.5 text-zinc-400" />
        <span className="font-medium text-xs text-zinc-500 uppercase tracking-wide dark:text-zinc-400">
          Bundled Tasks ({taskIds.length})
        </span>
      </div>
      <div className="max-h-48 space-y-1 overflow-y-auto">
        {taskIds.map((taskId) => (
          <button
            key={taskId}
            type="button"
            onClick={() => onOpenBundleTask?.(taskId)}
            className="flex h-8 w-full items-center rounded-md border border-zinc-200 bg-zinc-50 px-3 text-left text-sm transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-blue-700 dark:hover:bg-blue-950/30"
          >
            <span className="font-medium text-xs text-zinc-600 dark:text-zinc-300">
              Task #{taskId}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
