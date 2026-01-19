import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useRef } from 'react'
import { api } from '@/api'
import { useTaskBundleContext } from '../../../../contexts/TaskBundleContext'
import { useTaskContext } from '../../../../contexts/TaskContext'
import { useTaskMapContext } from '../../../../contexts/TaskMapContext'
import { repositionTaskFeaturesLayers } from '../../../TaskFeaturesLayer/taskFeaturesLayerPositioning'
import { zoomToTask } from '../../../zoomToTask'
import { LAYER_IDS } from './const'
import { TaskMarkerCleanupManager } from './managers/TaskMarkerCleanupManager'
import { TaskMarkerDataManager } from './managers/TaskMarkerDataManager'
import { TaskMarkerSetupManager } from './managers/TaskMarkerSetupManager'
import { createFeatureCollectionFromData } from './utils/dataUtils'

interface TaskFeaturesManagerProps {
  showTaskFeatures?: boolean
  dataLayerOrder?: ('task-features' | 'osm-data')[]
}

/**
 * Main component to coordinate all task marker management for TaskEditPage
 * Delegates responsibilities to specialized manager components:
 * - TaskMarkerSetupManager: Handles map setup, layers, and event listeners
 * - TaskMarkerDataManager: Handles updating source data when markers/clusters change
 * - TaskMarkerCleanupManager: Handles cleanup on unmount
 */
export const TaskFeaturesManager = ({
  showTaskFeatures = true,
  dataLayerOrder = ['task-features', 'osm-data'],
}: TaskFeaturesManagerProps) => {
  const { task } = useTaskContext()
  const { visibleTaskIds } = useTaskBundleContext()
  const { map, mapLoaded, clusteringEnabled, currentStyleId } = useTaskMapContext()
  const { data: taskMarkers, isLoading: dataLoading } = useQuery(
    api.challenge.getChallengeTaskMarkers(task.parent)
  )

  const filteredTaskMarkers = useMemo(() => {
    if (!taskMarkers) return undefined
    if (!visibleTaskIds || visibleTaskIds.length === 0) return taskMarkers
    return taskMarkers.filter((marker) => visibleTaskIds.includes(marker.id))
  }, [taskMarkers, visibleTaskIds])

  // When clustering is enabled, use client-side clustering (disable task count filter)
  // When clustering is disabled, use task count filter for server-side clustering
  const useTaskCountFilter = !clusteringEnabled

  const initialFeatureCollection = useMemo(() => {
    return createFeatureCollectionFromData(
      filteredTaskMarkers,
      task.id ? String(task.id) : undefined
    )
  }, [filteredTaskMarkers, task.id])

  const hasInitialZoomedRef = useRef(false)

  // Handle layer visibility based on showTaskFeatures
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    const visibility = showTaskFeatures ? 'visible' : 'none'
    const layerIds = [LAYER_IDS.clusters, LAYER_IDS.clusterCount, LAYER_IDS.points]

    layerIds.forEach((layerId) => {
      const layer = map.current?.getLayer(layerId)
      if (layer) {
        try {
          map.current?.setLayoutProperty(layerId, 'visibility', visibility)
        } catch {
          // Ignore errors
        }
      }
    })

    const highlightLayerId = `${LAYER_IDS.points}-highlight`
    const highlightLayer = map.current.getLayer(highlightLayerId)
    if (highlightLayer) {
      try {
        map.current.setLayoutProperty(highlightLayerId, 'visibility', visibility)
      } catch {
        // Ignore errors
      }
    }
  }, [map, mapLoaded, showTaskFeatures])

  // Handle layer positioning based on dataLayerOrder
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    const existingLayers = [
      LAYER_IDS.clusters,
      LAYER_IDS.clusterCount,
      LAYER_IDS.points,
      `${LAYER_IDS.points}-highlight`,
    ].filter((id) => map.current?.getLayer(id))

    if (existingLayers.length > 0) {
      repositionTaskFeaturesLayers(map.current, existingLayers, dataLayerOrder)
    }
  }, [map, mapLoaded, dataLayerOrder])

  // Handle initial zoom to primary task
  useEffect(() => {
    if (!map.current || !mapLoaded || hasInitialZoomedRef.current || !task) {
      return
    }

    const timeoutId = setTimeout(() => {
      if (map.current && !hasInitialZoomedRef.current && task) {
        hasInitialZoomedRef.current = true
        zoomToTask(map.current, task)
      }
    }, 500)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [map, mapLoaded, task])

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
        taskMarkers={filteredTaskMarkers}
        clusteringEnabled={clusteringEnabled}
        highlightTaskId={task.id ? String(task.id) : undefined}
      />
      <TaskMarkerCleanupManager />
    </>
  )
}
