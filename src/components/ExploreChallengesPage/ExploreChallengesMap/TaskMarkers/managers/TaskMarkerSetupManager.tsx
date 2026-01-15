import type maplibregl from 'maplibre-gl'
import { useEffect, useRef } from 'react'
import { LAYER_IDS } from '../const'
import { createMarkerIcons } from '../createMarkerIcons'
import { setupEventListeners } from '../eventListeners'
import { cleanupLayers, cleanupPopups } from '../utils/mapCleanup'
import { addMapLayers } from '../addMapLayers'

interface TaskMarkerSetupManagerProps {
  map: React.RefObject<maplibregl.Map | null>
  mapLoaded: boolean
  isLoading: boolean
  styleId: string
  clusteringEnabled: boolean
  useTaskCountFilter: boolean
  includeHighlight: boolean
}

/**
 * Manages the initial setup of task markers on the map
 * Handles source creation, layer addition, icon creation, and event listeners
 */
export const TaskMarkerSetupManager = ({
  map,
  mapLoaded,
  isLoading,
  styleId,
  clusteringEnabled,
  useTaskCountFilter,
  includeHighlight,
}: TaskMarkerSetupManagerProps) => {
  const prevStyleIdRef = useRef(styleId)
  const prevClusteringRef = useRef(clusteringEnabled)
  const isInitializedRef = useRef(false)
  const eventListenerCleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!map.current || !mapLoaded || isLoading) {
      return
    }

    const styleChanged = prevStyleIdRef.current !== styleId
    const clusteringChanged = prevClusteringRef.current !== clusteringEnabled

    if (styleChanged) {
      prevStyleIdRef.current = styleId
      isInitializedRef.current = false
    }
    if (clusteringChanged) {
      prevClusteringRef.current = clusteringEnabled
    }

    const setupMarkers = () => {
      if (!map.current) {
        return
      }

      if (!map.current.isStyleLoaded()) {
        requestAnimationFrame(() => {
          if (map.current?.isStyleLoaded()) {
            setupMarkers()
          } else {
            setTimeout(setupMarkers, 10)
          }
        })
        return
      }

      try {
        // Clean up existing event listeners
        if (eventListenerCleanupRef.current) {
          eventListenerCleanupRef.current()
          eventListenerCleanupRef.current = null
        }

        // Create marker icons
        createMarkerIcons(map)

        const existingSource = map.current.getSource(LAYER_IDS.source) as
          | maplibregl.GeoJSONSource
          | undefined

        // If source exists and nothing changed, just ensure event listeners are set up
        if (existingSource && !styleChanged && !clusteringChanged && isInitializedRef.current) {
          if (!eventListenerCleanupRef.current) {
            eventListenerCleanupRef.current = setupEventListeners(map, LAYER_IDS)
          }
          return
        }

        // Clean up existing layers if source exists
        if (existingSource) {
          cleanupLayers(map.current, includeHighlight)
        }

        // Clean up popups on style or clustering changes
        if (styleChanged || clusteringChanged) {
          cleanupPopups()
        }

        // Create initial empty feature collection
        const initialData: GeoJSON.FeatureCollection = {
          type: 'FeatureCollection',
          features: [],
        }

        // Add or update source
        try {
          map.current.addSource(LAYER_IDS.source, {
            type: 'geojson',
            data: initialData,
            cluster: clusteringEnabled,
            clusterMaxZoom: 14,
            clusterRadius: 50,
            promoteId: 'id',
          })
        } catch (error) {
          const source = map.current.getSource(LAYER_IDS.source) as
            | maplibregl.GeoJSONSource
            | undefined
          if (!source) {
            console.error('Failed to add source:', error)
            return
          }
        }

        // Add map layers
        addMapLayers(map, {
          includeHighlight,
          useTaskCountFilter,
        })

        // Set up event listeners
        eventListenerCleanupRef.current = setupEventListeners(map, LAYER_IDS)

        isInitializedRef.current = true
      } catch (error) {
        console.error('Error setting up task markers:', error)
      }
    }

    setupMarkers()

    // Handle style load events
    const handleStyleLoad = () => {
      isInitializedRef.current = false
      setupMarkers()
    }

    map.current.on('style.load', handleStyleLoad)

    return () => {
      if (map.current) {
        map.current.off('style.load', handleStyleLoad)
      }

      if (eventListenerCleanupRef.current) {
        eventListenerCleanupRef.current()
        eventListenerCleanupRef.current = null
      }
    }
  }, [
    map,
    mapLoaded,
    clusteringEnabled,
    isLoading,
    styleId,
    useTaskCountFilter,
    includeHighlight,
  ])

  return null
}

