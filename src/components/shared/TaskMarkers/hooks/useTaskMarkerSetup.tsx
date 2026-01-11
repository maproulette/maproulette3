import type maplibregl from 'maplibre-gl'
import { useEffect, useRef } from 'react'
import type { TaskMarker } from '@/types/Task'
import { addMapLayers } from '../addMapLayers'
import { LAYER_IDS } from '../const'
import { createMarkerIcons } from '../createMarkerIcons'
import { setupEventListeners } from '../eventListeners'
import { cleanupLayers, cleanupPopups } from '../utils/mapCleanup'

export interface TaskMarkerSetupOptions {
  /** Map reference */
  map: React.RefObject<maplibregl.Map | null>
  /** Whether the map is loaded */
  mapLoaded: boolean
  /** Task markers to display */
  taskMarkers: TaskMarker[] | undefined
  /** Whether clustering is enabled */
  clusteringEnabled?: boolean
  /** Whether data is currently loading */
  isLoading?: boolean
  /** Optional style ID to track style changes */
  styleId?: string
  /** Whether to use server-side task count filter */
  useTaskCountFilter?: boolean
  /** Whether to include highlight layer */
  includeHighlight?: boolean
  /** Callback when setup is complete */
  onSetupComplete?: () => void
}

/**
 * Unified hook for setting up task markers on a map
 * Handles icon creation, layer setup, event listeners, and cleanup
 */
export const useTaskMarkerSetup = ({
  map,
  mapLoaded,
  taskMarkers,
  clusteringEnabled = true,
  isLoading = false,
  styleId,
  useTaskCountFilter = false,
  includeHighlight = true,
  onSetupComplete,
}: TaskMarkerSetupOptions) => {
  const prevStyleIdRef = useRef(styleId)
  const prevClusteringRef = useRef(clusteringEnabled)
  const isInitializedRef = useRef(false)

  useEffect(() => {
    if (!map.current || !mapLoaded || isLoading) return

    const styleChanged = prevStyleIdRef.current !== styleId
    const clusteringChanged = prevClusteringRef.current !== clusteringEnabled

    if (styleChanged) {
      prevStyleIdRef.current = styleId
    }
    if (clusteringChanged) {
      prevClusteringRef.current = clusteringEnabled
    }

    const existingSource = map.current.getSource(LAYER_IDS.source) as
      | maplibregl.GeoJSONSource
      | undefined

    const setupMarkers = () => {
      if (!map.current) return

      try {
        // Create marker icons first
        createMarkerIcons(map)

        // Cleanup existing layers if style or clustering changed
        if (styleChanged || clusteringChanged || !isInitializedRef.current) {
          cleanupLayers(map.current, includeHighlight)
          if (styleChanged || clusteringChanged) {
            cleanupPopups()
          }
        }

        // Update or create source
        if (existingSource && !styleChanged && !clusteringChanged && isInitializedRef.current) {
          // Source already exists and nothing major changed, just update data
          return
        }

        // Remove old source if it exists
        if (existingSource) {
          cleanupLayers(map.current, includeHighlight)
        }

        // Add new source with clustering configuration
        map.current.addSource(LAYER_IDS.source, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [],
          },
          cluster: clusteringEnabled,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        })

        // Add layers
        addMapLayers(map, {
          includeHighlight,
          useTaskCountFilter,
        })

        // Setup event listeners
        setupEventListeners(map)

        isInitializedRef.current = true
        onSetupComplete?.()
      } catch (error) {
        console.error('Error setting up task markers:', error)
      }
    }

    setupMarkers()

    // Handle style changes
    const handleStyleLoad = () => {
      isInitializedRef.current = false
      setupMarkers()
    }

    map.current.on('style.load', handleStyleLoad)

    return () => {
      if (map.current) {
        map.current.off('style.load', handleStyleLoad)
      }
    }
  }, [
    map,
    mapLoaded,
    taskMarkers,
    clusteringEnabled,
    isLoading,
    styleId,
    useTaskCountFilter,
    includeHighlight,
    onSetupComplete,
  ])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupPopups()
    }
  }, [])
}
