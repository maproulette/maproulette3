import { useQuery } from '@tanstack/react-query'
import { useMemo, useRef, useState } from 'react'
import { api } from '@/api'
import { useTaskBundleContext } from '../../contexts/TaskBundleContext'
import { useTaskContext } from '../../contexts/TaskContext'
import { useTaskMapContext } from '../../contexts/TaskMapContext'
import { TaskMarkerDataLoadingManager } from './managers/TaskMarkerDataLoadingManager'
import { TaskMarkerEventHandlersManager } from './managers/TaskMarkerEventHandlersManager'
import { TaskMarkerInitialZoomManager } from './managers/TaskMarkerInitialZoomManager'
import { TaskMarkerLayerPositioningManager } from './managers/TaskMarkerLayerPositioningManager'
import { TaskMarkerSetupManager } from './managers/TaskMarkerSetupManager'
import { TaskMarkerVisibilityManager } from './managers/TaskMarkerVisibilityManager'
import { TaskMarkerVisibleCountManager } from './managers/TaskMarkerVisibleCountManager'

interface TaskFeaturesLayerProps {
  showTaskFeatures?: boolean
  dataLayerOrder?: ('task-features' | 'osm-data')[]
}

export const TaskFeaturesLayer = ({
  showTaskFeatures = true,
  dataLayerOrder = ['task-features', 'osm-data'],
}: TaskFeaturesLayerProps) => {
  const { task } = useTaskContext()
  const { visibleTaskIds } = useTaskBundleContext()
  const { map, mapLoaded, clusteringEnabled, currentStyleId } = useTaskMapContext()
  const { data: taskMarkers, isLoading: isLoadingTaskMarkers } = useQuery(
    api.challenge.getChallengeTaskMarkers(task.parent)
  )

  const filteredTaskMarkers = useMemo(() => {
    if (!taskMarkers) return undefined
    if (!visibleTaskIds || visibleTaskIds.length === 0) return taskMarkers
    return taskMarkers.filter((marker) => visibleTaskIds.includes(marker.id))
  }, [taskMarkers, visibleTaskIds])

  const currentFeatureDataRef = useRef<GeoJSON.FeatureCollection | null>(null)
  const [sourceReady, setSourceReady] = useState(false)
  const dataRestoredRef = useRef(false)

  return (
    <>
      <TaskMarkerSetupManager
        map={map}
        mapLoaded={mapLoaded}
        taskMarkers={filteredTaskMarkers}
        clusteringEnabled={clusteringEnabled}
        isLoading={isLoadingTaskMarkers}
        styleId={currentStyleId}
        currentFeatureDataRef={currentFeatureDataRef}
        setSourceReady={setSourceReady}
        dataRestoredRef={dataRestoredRef}
      />
      <TaskMarkerVisibilityManager
        map={map}
        mapLoaded={mapLoaded}
        sourceReady={sourceReady}
        showTaskFeatures={showTaskFeatures}
      />
      <TaskMarkerLayerPositioningManager
        map={map}
        mapLoaded={mapLoaded}
        sourceReady={sourceReady}
        dataLayerOrder={dataLayerOrder}
      />
      <TaskMarkerEventHandlersManager
        map={map}
        mapLoaded={mapLoaded}
        sourceReady={sourceReady}
        currentStyleId={currentStyleId}
      />
      <TaskMarkerInitialZoomManager map={map} mapLoaded={mapLoaded} task={task} />
      <TaskMarkerVisibleCountManager
        map={map}
        taskMarkers={filteredTaskMarkers}
        mapLoaded={mapLoaded}
      />
      <TaskMarkerDataLoadingManager
        map={map}
        mapLoaded={mapLoaded}
        filteredTaskMarkers={filteredTaskMarkers}
        isLoadingTaskMarkers={isLoadingTaskMarkers}
        effectiveClusteringEnabled={clusteringEnabled}
        effectiveStyleId={currentStyleId}
        sourceReady={sourceReady}
        dataRestoredRef={dataRestoredRef}
        currentFeatureDataRef={currentFeatureDataRef}
        setSourceReady={setSourceReady}
        highlightTaskId={task.id ? String(task.id) : undefined}
      />
    </>
  )
}
