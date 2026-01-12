import maplibregl from 'maplibre-gl'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { ChunkLoadingIndicator } from '@/components/shared/TaskMarkers/ChunkLoadingIndicator'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import { useTaskMarkerSetup } from '@/components/shared/TaskMarkers/hooks/useTaskMarkerSetup'
import { useVisibleTaskCount } from '@/components/shared/TaskMarkers/hooks/useVisibleTaskCount'
import { detectOverlappingTasks } from '@/components/shared/TaskMarkers/overlapUtils'
import { createFeatureCollection } from '@/components/shared/TaskMarkers/utils/featureCreation'
import { TaskMapContext } from '@/contexts/tasks/TaskMapContext'
import type { TaskMarker } from '@/types/Task'
import { createOptimalChunks } from './utils/dataChunking'

export interface TaskMarkersProps {
  taskMarkers: TaskMarker[] | undefined
  isLoadingTaskMarkers: boolean
  zoomToTaskId?: string
  visibleTaskIds?: number[]
  map: React.RefObject<maplibregl.Map | null>
  mapLoaded: boolean
  clusteringEnabled?: boolean
  hoveredTaskId?: number | null
  selectedTaskIds?: number[]
  setSelectedTaskIds?: (taskIds: number[]) => void
  onClusteringToggle?: (enabled: boolean) => void
  currentStyleId?: string
  setHoveredTaskId?: (taskId: number | null) => void
  showTaskFeatures?: boolean
}

export const TaskMarkers = ({
  taskMarkers,
  isLoadingTaskMarkers,
  zoomToTaskId,
  visibleTaskIds,
  map,
  mapLoaded,
  clusteringEnabled = true,
  hoveredTaskId = null,
  selectedTaskIds = [],
  setSelectedTaskIds,
  onClusteringToggle: _onClusteringToggle,
  currentStyleId,
  setHoveredTaskId: propSetHoveredTaskId,
  showTaskFeatures = true,
}: TaskMarkersProps) => {
  const filteredTaskMarkers = useMemo(() => {
    if (!taskMarkers) return undefined
    if (!visibleTaskIds || visibleTaskIds.length === 0) return taskMarkers
    return taskMarkers.filter((marker) => visibleTaskIds.includes(marker.id))
  }, [taskMarkers, visibleTaskIds])

  useVisibleTaskCount(map, filteredTaskMarkers, mapLoaded)

  const [isLoadingChunks, setIsLoadingChunks] = useState(false)
  const [chunksLoaded, setChunksLoaded] = useState(0)
  const [totalChunks, setTotalChunks] = useState(0)
  const abortControllerRef = useRef<AbortController | null>(null)
  const hasZoomedRef = useRef(false)
  const lastZoomToTaskIdRef = useRef(zoomToTaskId)
  const currentFeatureDataRef = useRef<GeoJSON.FeatureCollection | null>(null)

  if (lastZoomToTaskIdRef.current !== zoomToTaskId) {
    lastZoomToTaskIdRef.current = zoomToTaskId
    hasZoomedRef.current = false
  }

  useEffect(() => {
    if (zoomToTaskId && setSelectedTaskIds) {
      const taskId = Number(zoomToTaskId)
      if (!Number.isNaN(taskId) && !selectedTaskIds.includes(taskId)) {
        setSelectedTaskIds([taskId])
      }
    }
  }, [zoomToTaskId, setSelectedTaskIds, selectedTaskIds])

  const [sourceReady, setSourceReady] = useState(false)
  const lastStyleIdRef = useRef(currentStyleId)
  const dataRestoredRef = useRef(false)

  // Update feature properties for hover/selection (layout properties need properties, not feature-state)
  useEffect(() => {
    if (!map.current || !mapLoaded || !sourceReady) return

    const source = map.current.getSource(LAYER_IDS.source)
    if (!source || source.type !== 'geojson') return

    const geoJsonSource = source as maplibregl.GeoJSONSource
    const currentData = geoJsonSource._data as GeoJSON.FeatureCollection

    if (!currentData?.features) return

    let dataChanged = false

    // Update feature properties for hover/selection
    currentData.features.forEach((feature) => {
      const taskId = feature.properties?.id
      if (taskId === undefined || feature.id === undefined) return

      const isHovered = hoveredTaskId !== null && taskId === hoveredTaskId
      const isSelected = selectedTaskIds.includes(taskId)
      const isHighlighted = feature.properties?.isHighlighted || false

      // Update properties if they changed
      if (feature.properties?.isHovered !== isHovered || feature.properties?.isSelected !== isSelected) {
        if (feature.properties) {
          feature.properties.isHovered = isHovered
          feature.properties.isSelected = isSelected
          dataChanged = true
        }
      }

      // Also set feature state for any paint properties that might use it
      try {
        map.current?.setFeatureState(
          { source: LAYER_IDS.source, id: feature.id },
          { hover: isHovered, selected: isSelected, highlighted: isHighlighted }
        )
      } catch (_err) {
        // Feature might not exist, ignore
      }
    })

    // Update source data if properties changed (needed for layout properties)
    if (dataChanged && map.current) {
      geoJsonSource.setData(currentData)
    }
  }, [hoveredTaskId, selectedTaskIds, map, mapLoaded, sourceReady])

  // Track style changes to know when to restore data
  useEffect(() => {
    if (lastStyleIdRef.current !== currentStyleId) {
      dataRestoredRef.current = false
      lastStyleIdRef.current = currentStyleId
    }
  }, [currentStyleId])

  // Get setHoveredTaskId from context if prop is not provided
  // Use useContext directly to safely check if context is available
  const taskMapContext = useContext(TaskMapContext)
  const contextSetHoveredTaskId = taskMapContext?.setHoveredTaskId

  // Use prop if provided, otherwise fall back to context
  const setHoveredTaskId = propSetHoveredTaskId ?? contextSetHoveredTaskId

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
      // If we restored data, mark it so we don't reload
      if (currentFeatureDataRef.current) {
        dataRestoredRef.current = true
      }
    },
  })

  // Reset sourceReady when style changes, but preserve data
  useEffect(() => {
    setSourceReady(false)
  }, [currentStyleId])

  // Control layer visibility based on showTaskFeatures
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    // Wait for style to be loaded and layers to exist
    if (!map.current.isStyleLoaded()) {
      const checkStyle = () => {
        if (map.current?.isStyleLoaded()) {
          updateLayerVisibility()
        } else {
          requestAnimationFrame(checkStyle)
        }
      }
      checkStyle()
      return
    }

    updateLayerVisibility()

    function updateLayerVisibility() {
      if (!map.current) return

      const visibility = showTaskFeatures ? 'visible' : 'none'
      const layerIds = [LAYER_IDS.clusters, LAYER_IDS.clusterCount, LAYER_IDS.points]

      layerIds.forEach((layerId) => {
        const layer = map.current?.getLayer(layerId)
        if (layer) {
          try {
            map.current?.setLayoutProperty(layerId, 'visibility', visibility)
          } catch (error) {
            // Layer might not be ready yet, ignore
          }
        }
      })

      // Also handle highlight layer if it exists
      const highlightLayerId = `${LAYER_IDS.points}-highlight`
      const highlightLayer = map.current?.getLayer(highlightLayerId)
      if (highlightLayer) {
        try {
          map.current?.setLayoutProperty(highlightLayerId, 'visibility', visibility)
        } catch (error) {
          // Layer might not be ready yet, ignore
        }
      }
    }

    // Also set up a check to update visibility when layers are added
    const checkLayers = setInterval(() => {
      if (!map.current) {
        clearInterval(checkLayers)
        return
      }
      
      const hasAllLayers = [LAYER_IDS.clusters, LAYER_IDS.clusterCount, LAYER_IDS.points].every(
        (layerId) => map.current?.getLayer(layerId)
      )
      
      if (hasAllLayers) {
        updateLayerVisibility()
        clearInterval(checkLayers)
      }
    }, 100)

    return () => {
      clearInterval(checkLayers)
    }
  }, [map, mapLoaded, showTaskFeatures])

  useEffect(() => {
    // Skip data loading if we already restored the data (prevents flashing)
    if (dataRestoredRef.current && currentFeatureDataRef.current) {
      return
    }

    if (
      !map.current ||
      !filteredTaskMarkers ||
      isLoadingTaskMarkers ||
      !mapLoaded ||
      !sourceReady
    ) {
      return
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    setIsLoadingChunks(true)

    const initializeProcessing = async () => {
      if (signal.aborted || !map.current) return

      try {
        // Wait for style to be loaded and source to be ready (important after style changes)
        // Use faster polling with requestAnimationFrame, with longer timeout for style changes
        const waitForReady = async (): Promise<maplibregl.GeoJSONSource | null> => {
          // Try for up to 3 seconds (180 frames at ~16ms each)
          for (let i = 0; i < 180; i++) {
            if (signal.aborted || !map.current) return null

            // First check if style is loaded
            if (!map.current.isStyleLoaded()) {
              await new Promise((resolve) => requestAnimationFrame(resolve))
              continue
            }

            // Then check if source exists
            const source = map.current.getSource(LAYER_IDS.source)
            if (source && source.type === 'geojson') {
              // Source exists and is the right type - it should be ready
              return source as maplibregl.GeoJSONSource
            }

            // Wait a frame before checking again
            await new Promise((resolve) => requestAnimationFrame(resolve))
          }
          return null
        }

        const source = await waitForReady()

        if (!source) {
          // If source still isn't ready, it might be that useTaskMarkerSetup hasn't run yet
          // In that case, the useEffect will retry when sourceReady becomes true
          setIsLoadingChunks(false)
          return
        }

        // Source is already typed as GeoJSONSource from waitForReady
        source.setData({
          type: 'FeatureCollection',
          features: [],
        })

        const taskChunks = createOptimalChunks(filteredTaskMarkers)
        setTotalChunks(taskChunks.length)
        setChunksLoaded(0)

        const allFeatures: GeoJSON.Feature[] = []

        for (let chunkIndex = 0; chunkIndex < taskChunks.length; chunkIndex++) {
          if (signal.aborted || !map.current) break

          const chunk = taskChunks[chunkIndex]

          await new Promise<void>((resolve) => {
            requestAnimationFrame(() => {
              if (!map.current || signal.aborted) {
                resolve()
                return
              }

              try {
                const shouldDetectOverlaps = chunk.length < 2000
                const overlaps = shouldDetectOverlaps ? detectOverlappingTasks(chunk).overlaps : []

                const featureCollection = createFeatureCollection(
                  chunk,
                  overlaps,
                  zoomToTaskId,
                  selectedTaskIds,
                  hoveredTaskId
                )

                allFeatures.push(...featureCollection.features)

                // Store the feature data for style changes
                const finalFeatureCollection: GeoJSON.FeatureCollection = {
                  type: 'FeatureCollection',
                  features: allFeatures,
                }
                currentFeatureDataRef.current = finalFeatureCollection

                // Use the source we already have
                source.setData(finalFeatureCollection)

                // Initialize feature-state for all features immediately after setting data
                // This ensures the expressions work correctly
                const mapInstance = map.current
                if (mapInstance) {
                  allFeatures.forEach((feature) => {
                    const taskId = feature.properties?.id
                    if (taskId !== undefined && feature.id !== undefined) {
                      const isHovered = hoveredTaskId !== null && taskId === hoveredTaskId
                      const isSelected = selectedTaskIds.includes(taskId)
                      const isHighlighted = feature.properties?.isHighlighted || false

                      try {
                        mapInstance.setFeatureState(
                          { source: LAYER_IDS.source, id: feature.id },
                          { hover: isHovered, selected: isSelected, highlighted: isHighlighted }
                        )
                      } catch (_err) {
                        // Feature might not exist yet, ignore
                      }
                    }
                  })
                }

                setChunksLoaded(chunkIndex + 1)
              } catch (error) {
                console.error(`Error processing chunk ${chunkIndex}:`, error)
              }

              resolve()
            })
          })
        }

        setIsLoadingChunks(false)
        dataRestoredRef.current = false // Data was loaded fresh, not restored

        if (map.current && filteredTaskMarkers.length > 0 && !hasZoomedRef.current) {
          hasZoomedRef.current = true

          if (zoomToTaskId) {
            const specificTask = filteredTaskMarkers.find(
              (marker) => String(marker.id) === String(zoomToTaskId)
            )

            if (specificTask) {
              map.current.flyTo({
                center: [specificTask.location.lng, specificTask.location.lat],
                zoom: 18,
                duration: 1500,
              })
            } else {
              console.warn(
                `Task ${zoomToTaskId} not found in markers. Available IDs:`,
                filteredTaskMarkers.map((m) => m.id)
              )
            }
          } else {
            const bounds = new maplibregl.LngLatBounds()
            filteredTaskMarkers.forEach((marker) => {
              bounds.extend([marker.location.lng, marker.location.lat])
            })

            if (!bounds.isEmpty()) {
              map.current.fitBounds(bounds, {
                padding: { top: 50, bottom: 50, left: 50, right: 50 },
                duration: 1500,
              })
            }
          }
        }
      } catch (error) {
        console.error('Error initializing task markers:', error)
        setIsLoadingChunks(false)
      }
    }

    const timeoutId = setTimeout(() => {
      initializeProcessing()
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [
    map,
    mapLoaded,
    filteredTaskMarkers,
    isLoadingTaskMarkers,
    clusteringEnabled,
    zoomToTaskId,
    selectedTaskIds,
    hoveredTaskId,
    currentStyleId,
    sourceReady,
  ])

  return (
    <ChunkLoadingIndicator
      isVisible={isLoadingChunks}
      chunksLoaded={chunksLoaded}
      totalChunks={totalChunks}
    />
  )
}
