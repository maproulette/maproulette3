import { AlertTriangle, Network } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/Label'
import { Switch } from '@/components/ui/switch'
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

  const showWarning =
    taskCount > 5000 ||
    (taskCount > 500 && !taskMarkerParams.cluster) ||
    (taskCount < 100 && taskMarkerParams.cluster)
  const warningMessage =
    taskCount > 5000
      ? 'Data is too large to cluster, zoom in to view tasks'
      : taskCount > 500 && !taskMarkerParams.cluster
        ? 'Clustering is enforced for 500+ tasks'
        : 'Clustering is disabled for less than 100 tasks'

  return (
    <div className="absolute bottom-4 left-4 space-y-2">
      <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
        <Label
          className={`flex items-center gap-2 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
        >
          <Switch
            checked={taskMarkerParams.cluster}
            onCheckedChange={handleToggle}
            disabled={disabled}
          />
          <Network className="h-4 w-4" />
          <span className="font-medium text-sm">Cluster Markers</span>
        </Label>

        <div className="mt-3 space-y-2">
          {taskCount !== undefined && taskCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {taskCount.toLocaleString()} tasks
              </Badge>
            </div>
          )}
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {taskMarkerParams.cluster
              ? 'Groups nearby tasks for better performance'
              : 'Shows individual task markers'}
          </p>
        </div>
      </div>

      {showWarning && (
        <Alert
          variant="destructive"
          className="border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-100"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{warningMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
