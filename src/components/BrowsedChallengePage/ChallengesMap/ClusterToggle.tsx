import { Network } from 'lucide-react'
import { useMapContext } from '@/contexts/MapContext'

interface ClusterToggleProps {
  disabled?: boolean
  taskCount?: number
}

export const ClusterToggle = ({
  disabled = false,
  taskCount,
}: ClusterToggleProps) => {
  const { clusteringEnabled, setClusteringEnabled } = useMapContext()

  return (
    <div className="absolute bottom-4 left-4 rounded-lg bg-white p-3 shadow-lg dark:bg-zinc-900">
      <label
        className={`flex items-center space-x-2 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      >
        <input
          type="checkbox"
          checked={clusteringEnabled}
          onChange={(e) => setClusteringEnabled(e.target.checked)}
          disabled={disabled}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
        />
        <Network className="h-4 w-4 text-gray-700 dark:text-gray-300" />
        <span className="font-medium text-gray-700 text-sm dark:text-gray-300">
          Cluster Markers
        </span>
      </label>

      {taskCount !== undefined && taskCount > 0 && (
        <p className="mt-1 text-gray-500 text-xs dark:text-gray-400">
          Tasks Visible: {taskCount.toLocaleString()}
        </p>
      )}
    </div>
  )
}
