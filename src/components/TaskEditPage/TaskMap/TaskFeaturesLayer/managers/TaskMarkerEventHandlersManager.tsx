import type maplibregl from 'maplibre-gl'
import { useEffect, useRef } from 'react'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import {
    attachTaskFeaturesEventHandlers,
    removeTaskFeaturesEventHandlers,
} from '../taskFeaturesEventHandlers/eventAttachments'

interface TaskMarkerEventHandlersManagerProps {
  map: React.RefObject<maplibregl.Map | null>
  mapLoaded: boolean
  sourceReady: boolean
  currentStyleId: string
}

/**
 * Manages event handlers for task marker layers
 */
export const TaskMarkerEventHandlersManager = ({
  map,
  mapLoaded,
  sourceReady,
  currentStyleId,
}: TaskMarkerEventHandlersManagerProps) => {
  const layersRef = useRef<string[]>([])
  const currentPopupRef = useRef<maplibregl.Popup | null>(null)
  const eventHandlerTimeoutRef = useRef<number | null>(null)
  const mapClickHandlerRef = useRef<((e: maplibregl.MapMouseEvent) => void) | null>(null)
  const mapMouseMoveHandlerRef = useRef<((e: maplibregl.MapMouseEvent) => void) | null>(null)

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

  // Handle event listeners
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
  }, [map, mapLoaded, sourceReady, currentStyleId])

  return null
}
