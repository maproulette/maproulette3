import { Network } from 'lucide-react'
import { useId } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Label } from '@/components/ui/Label'

export interface ClusterSliderProps {
  /** Whether the slider is disabled */
  disabled?: boolean
  /** Current task count to display */
  taskCount?: number
  /** Current cluster radius value (0 = unclustered) */
  clusterRadius?: number
  /** Callback when cluster radius changes */
  onChange?: (radius: number) => void
  /** Custom className for the container */
  className?: string
}

/**
 * ClusterSlider component for adjusting task marker clustering distance
 * Allows continuous control over cluster radius from 0 (unclustered) to 200
 */
export const ClusterSlider = ({
  disabled = false,
  taskCount,
  clusterRadius = 40,
  onChange,
  className = '',
}: ClusterSliderProps) => {
  const sliderId = useId()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled && onChange) {
      onChange(Number(e.target.value))
    }
  }

  const clusterLabel = `${clusterRadius}px`

  return (
    <div
      className={`absolute bottom-3 left-3 z-[100] max-w-[calc(100%-6rem)] md:bottom-4 md:left-4 md:max-w-none ${className}`}
    >
      <div className="rounded-lg border border-zinc-200 bg-white/95 p-2.5 shadow-lg backdrop-blur-sm md:bg-white md:p-3 dark:border-zinc-800 dark:bg-zinc-900/95 dark:md:bg-zinc-900">
        <Label
          htmlFor={sliderId}
          className={`flex items-center gap-1.5 md:gap-2 ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
        >
          <Network className="h-3.5 w-3.5 text-zinc-700 md:h-4 md:w-4 dark:text-zinc-300" />
          <span className="font-medium text-xs text-zinc-700 dark:text-zinc-300">
            Cluster Distance
          </span>
          <span className="ml-auto font-mono text-xs text-zinc-500 dark:text-zinc-400">
            {clusterLabel}
          </span>
        </Label>

        <div className="mt-2 md:mt-2.5">
          <input
            id={sliderId}
            type="range"
            min={0}
            max={50}
            step={1}
            value={clusterRadius}
            onChange={handleChange}
            disabled={disabled}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 accent-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-700"
          />
          <div className="mt-1 flex justify-between text-[10px] text-zinc-400 dark:text-zinc-500">
            <span>Off</span>
            <span>Max</span>
          </div>
        </div>

        {taskCount !== undefined && taskCount > 0 && (
          <div className="mt-2 flex items-center gap-2 md:mt-2.5">
            <Badge variant="secondary" className="text-xs">
              {taskCount.toLocaleString()} {taskCount === 1 ? 'task' : 'tasks'}
            </Badge>
          </div>
        )}
      </div>
    </div>
  )
}
