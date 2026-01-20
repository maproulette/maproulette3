import type maplibregl from 'maplibre-gl'
import { useQuery } from '@tanstack/react-query'
import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { api } from '@/api'
import { SingleTaskPopup } from '@/components/OverlapedMarkersPopup'
import { addMapLayers } from '../addMapLayers'
import { CLUSTER_CONFIG, LAYER_IDS } from '../const'
import { createMarkerIcons } from '../createMarkerIcons'
import { setupEventListeners } from '../eventListeners'
import { cleanupLayers, cleanupPopups } from '../utils/mapCleanup'
import { createPopupContainer } from '../utils/popupUtils'

interface TaskMarkerSetupManagerProps {
  map: React.RefObject<maplibregl.Map | null>
  mapLoaded: boolean
  isLoading: boolean
  styleId: string
  clusteringEnabled: boolean
  useTaskCountFilter: boolean
  initialData?: GeoJSON.FeatureCollection | null
}

// Export popup callback type for event listeners
export type PopupCallback = (taskId: number, coordinates: [number, number]) => void

// Component that renders the popup via portal using React Query
const PopupPortal = ({ 
  taskId, 
  map, 
  coordinates, 
  onClose 
}: { 
  taskId: number | null
  map: maplibregl.Map
  coordinates: [number, number] | null
  onClose: () => void
}) => {
  const portalTargetId = 'maplibre-popup-identifier'
  const [portalElement, setPortalElement] = React.useState<HTMLElement | null>(null)

  // Use React Query to fetch task data - MUST be called before any conditional returns
  // Use enabled option to control when the query runs
  const { data: taskData } = useQuery({
    ...api.task.getTask(taskId || 0),
    enabled: !!taskId, // Only fetch when taskId is available
  })

  // Wait for portal element to exist
  React.useEffect(() => {
    if (!taskId || !coordinates) {
      setPortalElement(null)
      return
    }

    // Check for element with retry logic (max 20 attempts = 1 second)
    let attempts = 0
    const maxAttempts = 20
    
    const checkForElement = () => {
      const element = document.getElementById(portalTargetId)
      if (element) {
        setPortalElement(element)
      } else if (attempts < maxAttempts) {
        attempts++
        setTimeout(checkForElement, 50)
      } else {
        console.warn('Portal target element not found after maximum retries:', portalTargetId)
      }
    }

    checkForElement()
  }, [taskId, coordinates, portalTargetId])

  // Early return AFTER all hooks have been called
  if (!taskId || !coordinates || !portalElement) {
    return null
  }

  return createPortal(
    <SingleTaskPopup 
      taskId={taskId} 
      map={map} 
      onClose={onClose} 
      initialTaskData={taskData}
      idenifier={portalTargetId}
    />,
    portalElement
  )
}

const getExistingData = (source: maplibregl.GeoJSONSource): GeoJSON.FeatureCollection | null => {
  const data = source._data
  if (
    data &&
    typeof data === 'object' &&
    'features' in data &&
    Array.isArray(data.features) &&
    data.features.length > 0
  ) {
    return data as GeoJSON.FeatureCollection
  }
  return null
}

const createSourceConfig = (
  data: GeoJSON.FeatureCollection,
  clusteringEnabled: boolean,
  useTaskCountFilter: boolean
) => {
  const useClientSideClustering = clusteringEnabled && !useTaskCountFilter
  const config: {
    type: 'geojson'
    data: GeoJSON.FeatureCollection
    promoteId: string
    cluster?: boolean
    clusterMaxZoom?: number
    clusterRadius?: number
    clusterProperties?: Record<string, unknown[]>
  } = {
    type: 'geojson',
    data,
    promoteId: 'id',
  }

  if (useClientSideClustering) {
    config.cluster = true
    config.clusterMaxZoom = CLUSTER_CONFIG.maxZoom
    config.clusterRadius = CLUSTER_CONFIG.radius
  }

  return { config, useClientSideClustering }
}

export const TaskMarkerSetupManager = ({
  map,
  mapLoaded,
  isLoading,
  styleId,
  clusteringEnabled,
  useTaskCountFilter,
  initialData,
}: TaskMarkerSetupManagerProps) => {
  const prevStateRef = useRef({ styleId, clusteringEnabled, useTaskCountFilter })
  const eventListenerCleanupRef = useRef<(() => void) | null>(null)
  const identifier = React.useId()
  const popupRef = useRef<maplibregl.Popup | null>(null)
  
  // Popup state management
  const [popupState, setPopupState] = useState<{
    taskId: number | null
    coordinates: [number, number] | null
  }>({ taskId: null, coordinates: null })

  const openPopup = (taskId: number, coordinates: [number, number]) => {
    setTimeout(() => {
      console.log('openPopup called with:', { taskId, coordinates })
      setPopupState({ taskId, coordinates })
    }, 100)
  }

  const closePopup = () => {
    setPopupState({ taskId: null, coordinates: null })
  }


  useEffect(() => {
    if (!map.current || !mapLoaded || isLoading) return

    const prev = prevStateRef.current
    const styleChanged = prev.styleId !== styleId
    const clusteringChanged =
      prev.clusteringEnabled !== clusteringEnabled || prev.useTaskCountFilter !== useTaskCountFilter

    const setupMarkers = () => {
      if (!map.current?.isStyleLoaded()) {
        requestAnimationFrame(setupMarkers)
        return
      }

      eventListenerCleanupRef.current?.()
      eventListenerCleanupRef.current = null

      createMarkerIcons(map)

      const existingSource = map.current.getSource(LAYER_IDS.source) as
        | maplibregl.GeoJSONSource
        | undefined

      if (existingSource && !styleChanged && !clusteringChanged) {
        eventListenerCleanupRef.current = setupEventListeners(map, LAYER_IDS, identifier, openPopup)
        return
      }

      const existingData = existingSource ? getExistingData(existingSource) : null
      const sourceData = existingData ??
        initialData ?? { type: 'FeatureCollection' as const, features: [] }

      if (existingSource) {
        cleanupLayers(map.current)
      }

      if ((styleChanged || clusteringChanged) && map.current) {
        cleanupPopups(map.current)
      }

      const { config, useClientSideClustering } = createSourceConfig(
        sourceData,
        clusteringEnabled,
        useTaskCountFilter
      )

      const currentSource = map.current.getSource(LAYER_IDS.source)
      if (currentSource) {
        try {
          map.current.removeSource(LAYER_IDS.source)
        } catch {}
      }

      try {
        map.current.addSource(LAYER_IDS.source, config)
      } catch (error) {
        const source = map.current.getSource(LAYER_IDS.source) as
          | maplibregl.GeoJSONSource
          | undefined
        if (source) {
          source.setData(sourceData)
        } else {
          console.error('Failed to add or update source:', error)
          return
        }
      }

      addMapLayers(map, {
        useTaskCountFilter,
        clientSideClustering: useClientSideClustering,
        clusteringEnabled,
        includeHighlight: true,
      })

      requestAnimationFrame(() => {
        if (map.current) {
          eventListenerCleanupRef.current = setupEventListeners(map, LAYER_IDS, identifier, openPopup)
        }
      })

      prevStateRef.current = { styleId, clusteringEnabled, useTaskCountFilter }
    }

    setupMarkers()

    const handleStyleLoad = () => setupMarkers()
    map.current.on('style.load', handleStyleLoad)

    return () => {
      map.current?.off('style.load', handleStyleLoad)
      eventListenerCleanupRef.current?.()
    }
  }, [map, mapLoaded, isLoading, styleId, clusteringEnabled, useTaskCountFilter, initialData, openPopup, identifier])

  // Create popup container when state is set
  useEffect(() => {
    if (!map.current || !popupState.taskId || !popupState.coordinates) {
      // Close popup if state is cleared
      if (popupRef.current) {
        popupRef.current.remove()
        popupRef.current = null
      }
      return
    }

    // Create popup container synchronously
    if (map.current && popupState.coordinates) {
      // Remove existing popup if any
      if (popupRef.current) {
        popupRef.current.remove()
      }
      
      popupRef.current = createPopupContainer(
        map.current,
        popupState.coordinates,
        'maplibre-popup-identifier'
      )
    }

    return () => {
      if (popupRef.current) {
        popupRef.current.remove()
        popupRef.current = null
      }
    }
  }, [map, popupState.taskId, popupState.coordinates])

  return (
    <>
      {popupState.taskId && popupState.coordinates && map.current && (
        <PopupPortal
          taskId={popupState.taskId}
          map={map.current}
          coordinates={popupState.coordinates}
          onClose={closePopup}
        />
      )}
    </>
  )
}
