import { useOSMDataContext } from '../../contexts/OSMDataContext'
import { OSMDataLayerManager } from './managers/OSMDataLayerManager'
import { PluginEditorsManager } from './managers/PluginEditorsManager'
import { TaskFeaturesManager } from './managers/TaskFeaturesManager'

/**
 * Main component to coordinate all task map layer management
 * Delegates responsibilities to specialized manager components:
 * - TaskFeaturesManager: Handles task features/markers layer
 * - OSMDataLayerManager: Handles OSM data layer
 * - PluginEditorsManager: Handles plugin editor UI
 */
export const TaskMapManager = () => {
  const { showTaskFeatures, dataLayerOrder } = useOSMDataContext()

  return (
    <>
      <TaskFeaturesManager showTaskFeatures={showTaskFeatures} dataLayerOrder={dataLayerOrder} />
      <OSMDataLayerManager />
      <PluginEditorsManager />
    </>
  )
}
