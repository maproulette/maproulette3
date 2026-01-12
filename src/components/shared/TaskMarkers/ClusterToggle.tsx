import { Network } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Label } from '@/components/ui/Label'
import { Switch } from '@/components/ui/Switch'

export interface ClusterToggleProps {
  /** Whether the toggle is disabled */
  disabled?: boolean
  /** Current task count to display */
  taskCount?: number
  /** Whether clustering is currently enabled */
  clusteringEnabled?: boolean
  /** Callback when clustering is toggled */
  onToggle?: (enabled: boolean) => void
  /** Custom className for the container */
  className?: string
  /** Show warning messages for large datasets */
  showWarnings?: boolean
}

/**
 * Unified ClusterToggle component for task marker clustering control
 * Provides consistent styling and behavior across all map implementations
 */
export const ClusterToggle = ({
  disabled = false,
  taskCount,
  clusteringEnabled = true,
  onToggle,
  className = '',
  showWarnings = false,
}: ClusterToggleProps) => {
  const handleToggle = (checked: boolean) => {
    if (!disabled && onToggle) {
      onToggle(checked)
    }
  }

  const warningMessage = showWarnings
    ? taskCount && taskCount > 5000
      ? 'Data is too large to cluster, zoom in to view tasks'
      : taskCount && taskCount > 500
        ? 'Clustering is enforced for 500+ tasks'
        : null
    : null

  const enforceDisabled = !!warningMessage || disabled

  return (
    <div
      className={`absolute bottom-3 left-3 z-[100] max-w-[calc(100%-6rem)] md:bottom-4 md:left-4 md:max-w-none ${className}`}
    >
      <div className="rounded-lg border border-zinc-200 bg-white/95 p-2.5 shadow-lg backdrop-blur-sm md:bg-white md:p-3 dark:border-zinc-800 dark:bg-zinc-900/95 dark:md:bg-zinc-900">
        <Label
          className={`flex items-center gap-1.5 md:gap-2 ${enforceDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
        >
          <Switch
            checked={clusteringEnabled}
            onCheckedChange={handleToggle}
            disabled={enforceDisabled}
          />
          <Network className="h-3.5 w-3.5 text-zinc-700 md:h-4 md:w-4 dark:text-zinc-300" />
          <span className="font-medium text-xs text-zinc-700 dark:text-zinc-300">
            Cluster Markers
          </span>
        </Label>

        <div className="mt-2 space-y-1.5 md:mt-3 md:space-y-2">
          {taskCount !== undefined && taskCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {taskCount.toLocaleString()} {taskCount === 1 ? 'task' : 'tasks'}
              </Badge>
            </div>
          )}
          {warningMessage && (
            <p className="text-orange-500 text-xs leading-tight dark:text-orange-400">
              {warningMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

