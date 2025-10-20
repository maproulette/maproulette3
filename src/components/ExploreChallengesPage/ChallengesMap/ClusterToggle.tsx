import { Network } from 'lucide-react'
import { useSearchContext } from '@/contexts/exploreChallenges/SearchContext'

interface ClusterToggleProps {
  disabled?: boolean
  taskCount?: number
}

export const ClusterToggle = ({ disabled = false, taskCount = 0 }: ClusterToggleProps) => {
  const { taskMarkerParams, setTaskMarkerParams } = useSearchContext()

  const handleToggle = (checked: boolean) => {
    setTaskMarkerParams((prev) => ({
      ...prev,
      cluster: checked,
    }))
  }

  return (
    <div className="absolute bottom-4 left-4 rounded-lg bg-white p-3 shadow-lg dark:bg-zinc-900">
      <label
        className={`flex items-center space-x-2 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      >
        <input
          type="checkbox"
          checked={taskMarkerParams.cluster}
          onChange={(e) => handleToggle(e.target.checked)}
          disabled={disabled}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
        />
        <Network className="h-4 w-4 text-gray-700 dark:text-gray-300" />
        <span className="font-medium text-gray-700 text-sm dark:text-gray-300">
          Cluster Markers
        </span>
      </label>
      <div className="mt-2 space-y-1">
        {taskCount !== undefined && taskCount > 0 && (
          <p className="text-gray-600 text-xs dark:text-gray-400">
            Total tasks: <span className="font-semibold">{taskCount.toLocaleString()}</span>
          </p>
        )}
        <p className="text-gray-500 text-xs dark:text-gray-400">
          {taskMarkerParams.cluster
            ? 'Groups nearby tasks for better performance'
            : 'Shows individual task markers'}
        </p>
        {taskCount > 5000 && (
          <p className="text-orange-600 text-xs dark:text-orange-400">
            ⚠️ Data is too large to cluster, zoom in to view tasks
          </p>
        )}
        {taskCount > 500 && !taskMarkerParams.cluster && (
          <p className="text-orange-600 text-xs dark:text-orange-400">
            ⚠️ Clustering is enforced for 500+ tasks
          </p>
        )}
        {taskCount < 100 && taskMarkerParams.cluster && (
          <p className="text-orange-600 text-xs dark:text-orange-400">
            ⚠️ Clustering is disabled for less than 100 tasks
          </p>
        )}
      </div>
    </div>
  )
}
