import { useQuery } from '@tanstack/react-query'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '@/api'
import { ChunkLoadingIndicator } from '@/components/shared/TaskMarkers/ChunkLoadingIndicator'
import { useTaskMarkerSetup } from '@/components/shared/TaskMarkers/hooks/useTaskMarkerSetup'
import { useVisibleTaskCount } from '@/components/shared/TaskMarkers/hooks/useVisibleTaskCount'
import { useTaskBundleContext } from '@/contexts/tasks/TaskBundleContext'
import { useTaskContext } from '@/contexts/tasks/TaskContext'
import { TaskMapContext, useTaskMapContext } from '@/contexts/tasks/TaskMapContext'
import {
  useTaskMarkerClickHandler,
  useTaskMarkerDataLoading,
  useTaskMarkerHoverState,
  useTaskMarkerInitialZoom,
  useTaskMarkerLayerPositioning,
  useTaskMarkerLayerVerification,
  useTaskMarkerLayerVisibility,
} from './hooks'

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
  const { map, mapLoaded, clusteringEnabled, hoveredTaskId, selectedTaskIds, currentStyleId } =
    useTaskMapContext()
  const { data: taskMarkers, isLoading: isLoadingTaskMarkers } = useQuery(
    api.challenge.getChallengeTaskMarkers(task.parent)
  )

  const filteredTaskMarkers = useMemo(() => {
    if (!taskMarkers) return undefined
    if (!visibleTaskIds || visibleTaskIds.length === 0) return taskMarkers
    return taskMarkers.filter((marker) => visibleTaskIds.includes(marker.id))
  }, [taskMarkers, visibleTaskIds])

  useVisibleTaskCount(map, filteredTaskMarkers, mapLoaded)

  const currentFeatureDataRef = useRef<GeoJSON.FeatureCollection | null>(null)
  const [sourceReady, setSourceReady] = useState(false)
  const dataRestoredRef = useRef(false)

  const taskMapContext = useContext(TaskMapContext)
  const setHoveredTaskId = taskMapContext?.setHoveredTaskId

  useTaskMarkerSetup({
    map,
    mapLoaded,
    taskMarkers: filteredTaskMarkers,
    clusteringEnabled,
    isLoading: isLoadingTaskMarkers,
    includeHighlight: true,
    styleId: currentStyleId,
    restoreData: currentFeatureDataRef.current,
    setHoveredTaskId,
    onSetupComplete: () => {
      setSourceReady(true)
      if (currentFeatureDataRef.current) {
        dataRestoredRef.current = true
      }
    },
  })

  useTaskMarkerClickHandler({ map, mapLoaded })

  useTaskMarkerHoverState({
    map,
    mapLoaded,
    sourceReady,
    hoveredTaskId,
    selectedTaskIds,
  })

  useTaskMarkerLayerVerification({
    map,
    mapLoaded,
    sourceReady,
    dataLayerOrder,
  })

  useTaskMarkerLayerVisibility({
    map,
    mapLoaded,
    showTaskFeatures,
  })

  useTaskMarkerLayerPositioning({
    map,
    mapLoaded,
    sourceReady,
    dataLayerOrder,
  })

  useTaskMarkerInitialZoom({
    map,
    mapLoaded,
    task,
  })

  const { isLoadingChunks, chunksLoaded, totalChunks } = useTaskMarkerDataLoading({
    map,
    mapLoaded,
    filteredTaskMarkers,
    isLoadingTaskMarkers,
    effectiveClusteringEnabled: clusteringEnabled,
    effectiveStyleId: currentStyleId,
    sourceReady,
    dataRestoredRef,
    currentFeatureDataRef,
    setSourceReady,
    highlightTaskId: task.id ? String(task.id) : undefined,
  })

  useEffect(() => {
    setSourceReady(false)
  }, [currentStyleId])

  return (
    <ChunkLoadingIndicator
      isVisible={isLoadingChunks}
      chunksLoaded={chunksLoaded}
      totalChunks={totalChunks}
    />
  )
}
