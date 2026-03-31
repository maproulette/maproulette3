import { ChevronDown, Lasso, RotateCcw, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import type { TaskBundle } from '@/components/TaskEditPage/TaskBundleContext'
import type { LassoMode } from '@/components/TaskEditPage/TaskMapContext'
import { MAX_SELECTED_TASKS } from '@/components/TaskEditPage/TaskMapContext'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/Collapsible'

interface MultiTaskPanelProps {
  activeBundle: TaskBundle | null
  initialBundle: TaskBundle | null
  drawingMode: LassoMode
  mapLoaded: boolean
  startDrawing: (mode: 'select') => void
  cancelDrawing: () => void
  resetBundle: () => void
  onClearBundle: () => void
}

export const MultiTaskPanel = ({
  activeBundle,
  initialBundle,
  drawingMode,
  mapLoaded,
  startDrawing,
  cancelDrawing,
  resetBundle,
  onClearBundle,
}: MultiTaskPanelProps) => {
  const [multiTaskPanelOpen, setMultiTaskPanelOpen] = useState(true)

  return (
    <Collapsible
      open={multiTaskPanelOpen}
      onOpenChange={setMultiTaskPanelOpen}
      className="rounded-lg bg-white/90 shadow-lg backdrop-blur-sm dark:bg-zinc-800/90"
    >
      {/* Header - always visible, clickable to expand/collapse */}
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-700/50">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-500" />
          <span className="font-medium text-sm text-zinc-700 dark:text-zinc-200">
            {activeBundle ? (
              <>
                Working on {activeBundle.taskIds.length} task
                {activeBundle.taskIds.length !== 1 ? 's' : ''}
                <span className="ml-1 text-zinc-400">({MAX_SELECTED_TASKS} max)</span>
              </>
            ) : (
              'Work on multiple tasks'
            )}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-zinc-400 transition-transform ${multiTaskPanelOpen ? 'rotate-180' : ''}`}
        />
      </CollapsibleTrigger>

      {/* Expandable content */}
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapse data-[state=open]:animate-expand">
        <div className="flex flex-col gap-2 border-zinc-200 border-t px-3 pt-2 pb-3 dark:border-zinc-700">
          {/* Lasso tool */}
          <button
            type="button"
            onClick={() => {
              if (drawingMode === 'select') {
                cancelDrawing()
              } else {
                startDrawing('select')
              }
            }}
            disabled={
              !mapLoaded ||
              (activeBundle ? activeBundle.taskIds.length >= MAX_SELECTED_TASKS : false)
            }
            className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 font-medium text-sm transition-colors ${
              drawingMode === 'select'
                ? 'bg-blue-500 text-white'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600'
            } disabled:cursor-not-allowed disabled:opacity-50`}
            title={
              activeBundle && activeBundle.taskIds.length >= MAX_SELECTED_TASKS
                ? 'Maximum tasks reached'
                : 'Draw to add tasks (D)'
            }
          >
            <Lasso className="h-4 w-4" />
            {drawingMode === 'select' ? 'Drawing...' : 'Draw to add tasks'}
          </button>

          {/* Clear all - only show when there's a bundle */}
          {activeBundle && (
            <button
              type="button"
              onClick={onClearBundle}
              className="flex items-center justify-center gap-2 rounded-md px-3 py-2 font-medium text-red-600 text-sm transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
              Work on only the primary task
            </button>
          )}

          {/* Reset to initial bundle - show when there was an initial bundle and current state differs */}
          {initialBundle &&
            (!activeBundle ||
              activeBundle.bundleId !== initialBundle.bundleId ||
              activeBundle.taskIds.length !== initialBundle.taskIds.length ||
              !activeBundle.taskIds.every((id) => initialBundle.taskIds.includes(id))) && (
              <button
                type="button"
                onClick={() => resetBundle()}
                className="flex items-center justify-center gap-2 rounded-md px-3 py-2 font-medium text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                <RotateCcw className="h-4 w-4" />
                Reset to initial bundle
              </button>
            )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
