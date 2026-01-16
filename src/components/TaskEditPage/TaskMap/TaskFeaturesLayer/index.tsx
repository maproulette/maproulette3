import { useQuery } from '@tanstack/react-query'
import type maplibregl from 'maplibre-gl'
import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '@/api'
import { ChunkLoadingIndicator } from '@/components/shared/TaskMarkers/ChunkLoadingIndicator'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import { useTaskMarkerSetup } from '@/components/shared/TaskMarkers/hooks/useTaskMarkerSetup'
import { useVisibleTaskCount } from '@/components/shared/TaskMarkers/hooks/useVisibleTaskCount'
import { useTaskBundleContext } from '../../contexts/TaskBundleContext'
import { useTaskContext } from '../../contexts/TaskContext'
import { useTaskMapContext } from '../../contexts/TaskMapContext'
import { zoomToTask } from '../zoomToTask'
import { useTaskMarkerDataLoading } from './hooks'
import {
  attachTaskFeaturesEventHandlers,
  removeTaskFeaturesEventHandlers,
} from './taskFeaturesEventHandlers'
import { repositionTaskFeaturesLayers } from './taskFeaturesLayerPositioning'

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

  useVisibleTaskCount(map, filteredTaskMarkers, mapLoaded)

  const currentFeatureDataRef = useRef<GeoJSON.FeatureCollection | null>(null)
  const [sourceReady, setSourceReady] = useState(false)
  const dataRestoredRef = useRef(false)

  const layersRef = useRef<string[]>([])
  const currentPopupRef = useRef<maplibregl.Popup | null>(null)
  const eventHandlerTimeoutRef = useRef<number | null>(null)
  const mapClickHandlerRef = useRef<((e: maplibregl.MapMouseEvent) => void) | null>(null)
  const mapMouseMoveHandlerRef = useRef<((e: maplibregl.MapMouseEvent) => void) | null>(null)
  const hasInitialZoomedRef = useRef(false)

  useTaskMarkerSetup({
    map,
    mapLoaded,
    taskMarkers: filteredTaskMarkers,
    clusteringEnabled,
    isLoading: isLoadingTaskMarkers,
    includeHighlight: true,
    styleId: currentStyleId,
    restoreData: currentFeatureDataRef.current,
    skipEventListeners: true, // Use our own event handlers
    onSetupComplete: () => {
      setSourceReady(true)
      if (currentFeatureDataRef.current) {
        dataRestoredRef.current = true
      }
    },
  })

  // Track layer IDs for event handlers - update whenever layers might change
  useEffect(() => {
    if (!map.current || !mapLoaded || !sourceReady) {
      layersRef.current = []
      return
    }

    const updateLayers = () => {
      if (!map.current) return

      const taskLayerIds = [LAYER_IDS.clusters, LAYER_IDS.clusterCount, LAYER_IDS.points].filter(
        (id) => map.current?.getLayer(id)
      )

      layersRef.current = taskLayerIds
    }

    // Update immediately
    updateLayers()

    // Also update after a delay to catch layers added asynchronously
    const timeoutId = setTimeout(updateLayers, 200)
    return () => clearTimeout(timeoutId)
  }, [map, mapLoaded, sourceReady, currentStyleId])

  // Handle event listeners, layer positioning, and visibility (similar to OSMDataLayer pattern)
  useEffect(() => {
    if (!map.current || !mapLoaded || !sourceReady) {
      if (map.current) {
        removeTaskFeaturesEventHandlers(
          map.current,
          {
            map,
            sourceId: LAYER_IDS.source,
            layersRef,
            currentPopupRef,
          },
          mapClickHandlerRef,
          mapMouseMoveHandlerRef
        )
      }
      return
    }

    // Update layer visibility
    const updateLayerVisibility = () => {
      if (!map.current) return

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
      const highlightLayer = map.current?.getLayer(highlightLayerId)
      if (highlightLayer) {
        try {
          map.current?.setLayoutProperty(highlightLayerId, 'visibility', visibility)
        } catch {
          // Ignore errors
        }
      }
    }

    // Check if layers exist before updating visibility
    if (map.current.isStyleLoaded()) {
      updateLayerVisibility()
    } else {
      const checkStyle = () => {
        if (map.current?.isStyleLoaded()) {
          updateLayerVisibility()
        } else {
          requestAnimationFrame(checkStyle)
        }
      }
      checkStyle()
    }

    // Handle layer positioning
    const existingLayers = [
      LAYER_IDS.clusters,
      LAYER_IDS.clusterCount,
      LAYER_IDS.points,
      `${LAYER_IDS.points}-highlight`,
    ].filter((id) => map.current?.getLayer(id))

    if (existingLayers.length > 0) {
      repositionTaskFeaturesLayers(map.current, existingLayers, dataLayerOrder)
    }

    // Attach event handlers
    attachTaskFeaturesEventHandlers(
      map.current,
      {
        map,
        sourceId: LAYER_IDS.source,
        layersRef,
        currentPopupRef,
      },
      eventHandlerTimeoutRef,
      mapClickHandlerRef,
      mapMouseMoveHandlerRef
    )

    return () => {
      if (eventHandlerTimeoutRef.current !== null) {
        clearTimeout(eventHandlerTimeoutRef.current)
        eventHandlerTimeoutRef.current = null
      }

      if (!map.current) return

      removeTaskFeaturesEventHandlers(
        map.current,
        {
          map,
          sourceId: LAYER_IDS.source,
          layersRef,
          currentPopupRef,
        },
        mapClickHandlerRef,
        mapMouseMoveHandlerRef
      )

      if (currentPopupRef.current) {
        currentPopupRef.current.remove()
        currentPopupRef.current = null
      }
    }
  }, [map, mapLoaded, sourceReady, showTaskFeatures, dataLayerOrder])

  // Handle initial zoom
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
