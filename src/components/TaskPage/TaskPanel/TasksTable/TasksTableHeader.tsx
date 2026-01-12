import { Package, RotateCcw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { Task } from '@/types/Task'

interface TasksTableHeaderProps {
  activeBundle?: {
    bundleId: number
    taskIds: number[]
    tasks?: Task[]
    name: string
  } | null
  initialBundle?: {
    bundleId: number
    taskIds: number[]
    tasks?: Task[]
    name: string
  } | null
  showBundleOnly: boolean
  currentLoading: boolean
  taskCount: number
  startIndex: number
  endIndex: number
  selectedTaskIds: Set<number>
  bundleEditsDisabled: boolean
  bundlingDisabledReason: string | null
  isBundling: boolean
  isUnbundling: boolean
  isTooManyTasks: boolean
  onShowBundleOnlyChange: (show: boolean) => void
  onResetBundle: () => void
  onClearBundle: () => void
  onCreateBundle: () => void
  getBundlingDisabledMessage: () => string | null
}

export const TasksTableHeader = ({
  activeBundle,
  initialBundle,
  showBundleOnly,
  currentLoading,
  taskCount,
  startIndex,
  endIndex,
  selectedTaskIds,
  bundleEditsDisabled,
  bundlingDisabledReason,
  isBundling,
  isUnbundling,
  isTooManyTasks,
  onShowBundleOnlyChange,
  onResetBundle,
  onClearBundle,
  onCreateBundle,
  getBundlingDisabledMessage,
}: TasksTableHeaderProps) => {
  return (
    <>
      {/* Bundling Disabled Message */}
      {bundleEditsDisabled && bundlingDisabledReason && (
        <div className="shrink-0 border-zinc-200 border-b bg-blue-50 px-4 py-2 text-center text-blue-800 text-sm dark:border-zinc-800 dark:bg-blue-900/30 dark:text-blue-200">
          {getBundlingDisabledMessage()}
        </div>
      )}

      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-zinc-200 border-b bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-sm">
            {activeBundle ? 'Bundle Tasks' : 'Visible Tasks'}
          </h3>
          <span className="rounded-full bg-zinc-200 px-2 py-0.5 font-medium text-xs dark:bg-zinc-800">
            {currentLoading
              ? 'Loading...'
              : taskCount > 0
                ? `${startIndex}-${endIndex} of ${taskCount}`
                : '0 tasks'}
          </span>
          {activeBundle && (
            <span className="rounded-full bg-purple-100 px-2 py-0.5 font-medium text-purple-700 text-xs dark:bg-purple-900/30 dark:text-purple-300">
              Bundle #{activeBundle.bundleId} ({activeBundle.taskIds.length} tasks)
            </span>
          )}
          {!activeBundle && selectedTaskIds.size > 0 && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 font-medium text-blue-700 text-xs dark:bg-blue-900/30 dark:text-blue-300">
              {selectedTaskIds.size} selected
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Show Bundle Only Toggle */}
          {activeBundle && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2"
              onClick={() => onShowBundleOnlyChange(!showBundleOnly)}
              title={showBundleOnly ? 'Show all tasks' : 'Show only bundled tasks'}
            >
              {showBundleOnly ? 'Show All Tasks' : 'Show Bundle Only'}
            </Button>
          )}
          {/* Bundle Management Buttons */}
          {activeBundle && initialBundle && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2"
              onClick={onResetBundle}
              disabled={bundleEditsDisabled || isUnbundling}
              title="Reset to initial bundle"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          )}
          {activeBundle && (
            <Button
              variant="destructive"
              size="sm"
              className="h-8 gap-2"
              onClick={onClearBundle}
              disabled={bundleEditsDisabled || isUnbundling}
              title="Delete bundle"
            >
              {isUnbundling ? (
                <>Loading...</>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Unbundle
                </>
              )}
            </Button>
          )}
          {/* Create Bundle Button */}
          {!activeBundle && selectedTaskIds.size > 1 && (
            <Button
              variant="default"
              size="sm"
              className="h-8 gap-2"
              onClick={onCreateBundle}
              disabled={bundleEditsDisabled || isTooManyTasks || isBundling}
              title={
                isTooManyTasks
                  ? 'Cannot bundle more than 50 tasks'
                  : 'Create bundle from selected tasks'
              }
            >
              {isBundling ? (
                <>Loading...</>
              ) : (
                <>
                  <Package className="h-4 w-4" />
                  {isTooManyTasks ? 'Too Many Tasks' : 'Bundle Tasks'}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
