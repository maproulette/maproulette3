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
  /** Optional initial data to restore when style changes (prevents flashing) */
  restoreData?: GeoJSON.FeatureCollection | null
  /** Callback to set hovered task ID */
  setHoveredTaskId?: (taskId: number | null) => void
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
  restoreData,
  setHoveredTaskId,
}: TaskMarkerSetupOptions) => {
  const prevStyleIdRef = useRef(styleId)
  const prevClusteringRef = useRef(clusteringEnabled)
  const isInitializedRef = useRef(false)
  const eventListenerCleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    console.log('useTaskMarkerSetup: useEffect triggered', {
      hasMap: !!map.current,
      mapLoaded,
      isLoading,
      hasTaskMarkers: !!taskMarkers,
      taskMarkersCount: taskMarkers?.length,
    })

    if (!map.current || !mapLoaded || isLoading) {
      console.log('useTaskMarkerSetup: Early return', {
        hasMap: !!map.current,
        mapLoaded,
        isLoading,
      })
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
      console.log('useTaskMarkerSetup: setupMarkers called')
      if (!map.current) {
        console.log('useTaskMarkerSetup: No map.current in setupMarkers')
        return
      }

      if (!map.current.isStyleLoaded()) {
        console.log('useTaskMarkerSetup: Style not loaded, waiting...')
        requestAnimationFrame(() => {
          if (map.current?.isStyleLoaded()) {
            setupMarkers()
          } else {
            setTimeout(setupMarkers, 10)
          }
        })
        return
      }

      console.log('useTaskMarkerSetup: Style loaded, proceeding with setup')

      try {
        if (eventListenerCleanupRef.current) {
          eventListenerCleanupRef.current()
          eventListenerCleanupRef.current = null
        }

        createMarkerIcons(map)

        const existingSource = map.current.getSource(LAYER_IDS.source) as
          | maplibregl.GeoJSONSource
          | undefined

        console.log('useTaskMarkerSetup: Checking existing source', {
          hasExistingSource: !!existingSource,
          styleChanged,
          clusteringChanged,
          isInitialized: isInitializedRef.current,
        })

        if (existingSource && !styleChanged && !clusteringChanged && isInitializedRef.current) {
          console.log('useTaskMarkerSetup: Early return - source exists and nothing changed')
          // Even if source exists, make sure event listeners are set up
          if (!eventListenerCleanupRef.current) {
            console.log('useTaskMarkerSetup: Event listeners not set up, setting them up now')
            eventListenerCleanupRef.current = setupEventListeners(map, LAYER_IDS, setHoveredTaskId)
          }
          return
        }

        if (existingSource) {
          cleanupLayers(map.current, includeHighlight)
        }

        if (styleChanged || clusteringChanged) {
          cleanupPopups()
        }

        const initialData = restoreData || {
          type: 'FeatureCollection',
          features: [],
        }

        try {
          map.current.addSource(LAYER_IDS.source, {
            type: 'geojson',
            data: initialData,
            cluster: clusteringEnabled,
            clusterMaxZoom: 14,
            clusterRadius: 50,
            promoteId: 'id',
          })
          console.log('Task marker source added', { sourceId: LAYER_IDS.source, clusteringEnabled })
        } catch (error) {
          const source = map.current.getSource(LAYER_IDS.source) as
            | maplibregl.GeoJSONSource
            | undefined
          if (!source) {
            console.error('Failed to add source:', error)
            return
          }

          if (restoreData) {
            source.setData(restoreData)
          }
        }

        addMapLayers(map, {
          includeHighlight,
          useTaskCountFilter,
        })

        const layersAdded = [LAYER_IDS.clusters, LAYER_IDS.clusterCount, LAYER_IDS.points].filter(
          (id) => map.current?.getLayer(id)
        )
        console.log('Task marker layers added', {
          layersAdded: layersAdded.length,
          layerIds: layersAdded,
          sourceExists: !!map.current.getSource(LAYER_IDS.source),
        })

        console.log('useTaskMarkerSetup: Setting up event listeners', {
          hasMap: !!map.current,
          hasLayers: [LAYER_IDS.clusters, LAYER_IDS.points].every(
            (id) => !!map.current?.getLayer(id)
          ),
          setHoveredTaskId: !!setHoveredTaskId,
        })

        eventListenerCleanupRef.current = setupEventListeners(map, LAYER_IDS, setHoveredTaskId)

        isInitializedRef.current = true
        console.log('useTaskMarkerSetup: Setup complete, calling onSetupComplete')
        onSetupComplete?.()
      } catch (error) {
        console.error('Error setting up task markers:', error)
      }
    }

    setupMarkers()

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
    taskMarkers,
    clusteringEnabled,
    isLoading,
    styleId,
    useTaskCountFilter,
    includeHighlight,
    onSetupComplete,
    restoreData,
    setHoveredTaskId,
  ])

  useEffect(() => {
    return () => {
      cleanupPopups()
    }
  }, [])
}
