import { Network } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Label } from '@/components/ui/Label'
import { Switch } from '@/components/ui/Switch'
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

  const warningMessage =
    taskCount > 5000
      ? 'Data is too large to cluster, zoom in to view tasks'
      : taskCount > 500
        ? 'Clustering is enforced for 500+ tasks'
        : null

  const inforceDisabled = !!warningMessage || disabled
  return (
    <div className="absolute bottom-3 left-3 z-[100] max-w-[calc(100%-6rem)] md:bottom-4 md:left-4 md:max-w-none">
      <div className="rounded-lg border border-zinc-200 bg-white/95 p-2.5 shadow-lg backdrop-blur-sm md:bg-white md:p-3 dark:border-zinc-800 dark:bg-zinc-900/95 dark:md:bg-zinc-900">
        <Label
          className={`flex items-center gap-1.5 md:gap-2 ${inforceDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
        >
          <Switch
            checked={taskMarkerParams.cluster}
            onCheckedChange={handleToggle}
            disabled={inforceDisabled}
          />
          <Network className="h-3.5 w-3.5 md:h-4 md:w-4" />
          <span className="font-medium text-xs">Cluster Markers</span>
        </Label>

        <div className="mt-2 space-y-1.5 md:mt-3 md:space-y-2">
          {taskCount !== undefined && taskCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {taskCount.toLocaleString()} tasks
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
