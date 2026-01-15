import { useMemo } from 'react'
import { useChallengeTaskMarkersContext } from './ChallengeTaskMarkersContext'
import { useExploreChallengesMapContext } from './ExploreChallengesMapContext'
import { TaskMarkerCleanupManager } from './TaskMarkers/managers/TaskMarkerCleanupManager'
import { TaskMarkerDataManager } from './TaskMarkers/managers/TaskMarkerDataManager'
import { TaskMarkerSetupManager } from './TaskMarkers/managers/TaskMarkerSetupManager'
import { shouldEnableClustering } from './TaskMarkers/utils/dataUtils'

/**
 * Main component to coordinate all task marker management
 * Delegates responsibilities to specialized manager components:
 * - TaskMarkerSetupManager: Handles map setup, layers, and event listeners
 * - TaskMarkerDataManager: Handles updating source data when markers/clusters change
 * - TaskMarkerCleanupManager: Handles cleanup on unmount
 */
export const ExploreChallengesTaskMarkerManager = () => {
  const { map, mapLoaded, currentStyleId } = useExploreChallengesMapContext()
  const { taskMarkers, clusters, dataLoading } = useChallengeTaskMarkersContext()

  // Configuration constants
  const useTaskCountFilter = true
  const includeHighlight = false

  // Memoize clustering enabled to prevent unnecessary recalculations
  const clusteringEnabled = useMemo(
    () => shouldEnableClustering(clusters, taskMarkers),
    [clusters, taskMarkers]
  )

  return (
    <>
      <TaskMarkerSetupManager
        map={map}
        mapLoaded={mapLoaded}
        isLoading={dataLoading}
        styleId={currentStyleId}
        clusteringEnabled={clusteringEnabled}
        useTaskCountFilter={useTaskCountFilter}
        includeHighlight={includeHighlight}
      />
      <TaskMarkerDataManager
        map={map}
        mapLoaded={mapLoaded}
        dataLoading={dataLoading}
        taskMarkers={taskMarkers}
        clusters={clusters}
      />
      <TaskMarkerCleanupManager />
    </>
  )
}
