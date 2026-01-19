import { TaskFeaturesLayer } from '../../TaskFeaturesLayer'

interface TaskFeaturesLayerManagerProps {
  showTaskFeatures?: boolean
  dataLayerOrder?: ('task-features' | 'osm-data')[]
}

/**
 * Manages the task features layer component
 */
export const TaskFeaturesLayerManager = ({
  showTaskFeatures,
  dataLayerOrder,
}: TaskFeaturesLayerManagerProps) => {
  return <TaskFeaturesLayer showTaskFeatures={showTaskFeatures} dataLayerOrder={dataLayerOrder} />
}
