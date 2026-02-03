import { Network } from 'lucide-react'

export interface ClusterToggleProps {
  /** Whether the toggle is disabled */
  disabled?: boolean
  /** Whether clustering is enabled */
  isClustered?: boolean
  /** Callback when clustering is toggled */
  onChange?: (isClustered: boolean) => void
  /** Custom className for the container */
  className?: string
}

/**
 * ClusterToggle component for toggling task marker clustering on/off
 */
export const ClusterToggle = ({
  disabled = false,
  isClustered = true,
  onChange,
  className = '',
}: ClusterToggleProps) => {
  const handleToggle = () => {
    if (!disabled && onChange) {
      onChange(!isClustered)
    }
  }

  return (
    <div
      className={`absolute bottom-3 left-3 z-[100] max-w-[calc(100%-6rem)] md:bottom-4 md:left-4 md:max-w-none ${className}`}
    >
      <div className="rounded-lg border border-zinc-200 bg-white/95 p-2.5 shadow-lg backdrop-blur-sm md:bg-white md:p-3 dark:border-zinc-800 dark:bg-zinc-900/95 dark:md:bg-zinc-900">
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`flex items-center gap-2 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
        >
          <Network className="h-3.5 w-3.5 text-zinc-700 md:h-4 md:w-4 dark:text-zinc-300" />
          <span className="font-medium text-xs text-zinc-700 dark:text-zinc-300">Clustering</span>
          <div
            className={`relative ml-2 h-5 w-9 rounded-full transition-colors ${
              isClustered ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-600'
            }`}
          >
            <div
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                isClustered ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </div>
        </button>
      </div>
    </div>
  )
}

// Keep old export for backwards compatibility
export const ClusterSlider = ClusterToggle
