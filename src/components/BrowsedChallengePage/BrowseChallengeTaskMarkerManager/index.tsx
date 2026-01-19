import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { api } from '@/api'
import { useBrowseChallengeMapContext } from '../contexts/BrowseChallengeMapContext'
import { useBrowsedChallengeContext } from '../contexts/BrowsedChallengeContext'
import { TaskMarkerCleanupManager } from './managers/TaskMarkerCleanupManager'
import { TaskMarkerDataManager } from './managers/TaskMarkerDataManager'
import { TaskMarkerSetupManager } from './managers/TaskMarkerSetupManager'
import { createFeatureCollectionFromData } from './utils/dataUtils'
import { MapZoomToMarkersManager } from '../MapZoomToMarkersManager'

/**
 * Main component to coordinate all task marker management
 * Delegates responsibilities to specialized manager components:
 * - TaskMarkerSetupManager: Handles map setup, layers, and event listeners
 * - TaskMarkerDataManager: Handles updating source data when markers/clusters change
 * - TaskMarkerCleanupManager: Handles cleanup on unmount
 */
export const BrowseChallengeTaskMarkerManager = () => {
  const { map, mapLoaded, currentStyleId, clusteringEnabled } = useBrowseChallengeMapContext()
  const { challenge } = useBrowsedChallengeContext()
  const { data: taskMarkers, isLoading: dataLoading } = useQuery(
    api.challenge.getChallengeTaskMarkers(challenge.id)
  )

  // When clustering is enabled, use client-side clustering (disable task count filter)
  // When clustering is disabled, use task count filter for server-side clustering
  const useTaskCountFilter = !clusteringEnabled

  const initialFeatureCollection = useMemo(() => {
    return createFeatureCollectionFromData(taskMarkers)
  }, [taskMarkers])

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
      <MapZoomToMarkersManager />
      <TaskMarkerDataManager
        map={map}
        mapLoaded={mapLoaded}
        dataLoading={dataLoading}
        taskMarkers={taskMarkers}
        clusteringEnabled={clusteringEnabled}
      />
      <TaskMarkerCleanupManager />
    </>
  )
}
