import { ClusterToggle } from '@/components/shared/TaskMarkers/ClusterToggle'
import { useTaskMapContext } from '../../../contexts/TaskMapContext'

interface ClusterToggleManagerProps {
  disabled: boolean
  taskCount?: number
}

/**
 * Manages the cluster toggle UI component
 */
export const ClusterToggleManager = ({ disabled, taskCount }: ClusterToggleManagerProps) => {
  const { clusteringEnabled, setClusteringEnabled } = useTaskMapContext()

  return (
    <ClusterToggle
      disabled={disabled}
      taskCount={taskCount}
      clusteringEnabled={clusteringEnabled}
      onToggle={setClusteringEnabled}
    />
  )
}
