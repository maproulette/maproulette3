import { useMemo } from 'react'
import { useChallengeTaskMarkersContext } from '../ChallengeTaskMarkersContext'
import { useExploreChallengesMapContext } from '../ExploreChallengesMapContext'
import { TaskMarkerCleanupManager } from './managers/TaskMarkerCleanupManager'
import { TaskMarkerDataManager } from './managers/TaskMarkerDataManager'
import { TaskMarkerSetupManager } from './managers/TaskMarkerSetupManager'
import { createFeatureCollectionFromData } from './utils/dataUtils'

/**
 * Main component to coordinate all task marker management
 * Delegates responsibilities to specialized manager components:
 * - TaskMarkerSetupManager: Handles map setup, layers, and event listeners
 * - TaskMarkerDataManager: Handles updating source data when markers/clusters change
 * - TaskMarkerCleanupManager: Handles cleanup on unmount
 */
export const ExploreChallengesTaskMarkerManager = () => {
  const { map, mapLoaded, currentStyleId, clusteringEnabled } = useExploreChallengesMapContext()
  const { taskMarkers, clusters, dataLoading } = useChallengeTaskMarkersContext()

  const useTaskCountFilter = true

  const initialFeatureCollection = useMemo(() => {
    return createFeatureCollectionFromData(taskMarkers, clusters)
  }, [taskMarkers, clusters])

  return (
    <>
      <TaskMarkerSetupManager
        map={map}
        mapLoaded={mapLoaded}
        isLoading={dataLoading}
        styleId={currentStyleId}
        clusteringEnabled={clusteringEnabled}
        useTaskCountFilter={useTaskCountFilter}
        initialData={initialFeatureCollection}
      />
      <TaskMarkerDataManager
        map={map}
        mapLoaded={mapLoaded}
        dataLoading={dataLoading}
        taskMarkers={taskMarkers}
        clusters={clusters}
        clusteringEnabled={clusteringEnabled}
      />
      <TaskMarkerCleanupManager />
    </>
  )
}
