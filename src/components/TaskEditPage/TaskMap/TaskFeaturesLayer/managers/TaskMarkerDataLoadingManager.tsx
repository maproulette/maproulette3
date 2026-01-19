import type maplibregl from 'maplibre-gl'
import { useEffect, useRef, useState } from 'react'
import { ChunkLoadingIndicator } from '@/components/shared/TaskMarkers/ChunkLoadingIndicator'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import { detectOverlappingTasks } from '@/components/shared/TaskMarkers/overlapUtils'
import { createFeatureCollection } from '@/components/shared/TaskMarkers/utils/featureCreation'
import type { TaskMarker } from '@/types/Task'
import { createOptimalChunks } from '@/utils/dataChunking'

interface TaskMarkerDataLoadingManagerProps {
  map: React.RefObject<maplibregl.Map | null>
  mapLoaded: boolean
  filteredTaskMarkers: TaskMarker[] | undefined
  isLoadingTaskMarkers: boolean
  effectiveClusteringEnabled: boolean
  effectiveStyleId: string | undefined
  sourceReady: boolean
  dataRestoredRef: React.MutableRefObject<boolean>
  currentFeatureDataRef: React.MutableRefObject<GeoJSON.FeatureCollection | null>
  setSourceReady: (ready: boolean) => void
  highlightTaskId?: string
}

/**
 * Manages loading and processing task marker data in chunks
 */
export const TaskMarkerDataLoadingManager = ({
  map,
  mapLoaded,
  filteredTaskMarkers,
  isLoadingTaskMarkers,
  effectiveClusteringEnabled: _effectiveClusteringEnabled,
  effectiveStyleId: _effectiveStyleId,
  sourceReady,
  dataRestoredRef,
  currentFeatureDataRef,
  setSourceReady: _setSourceReady,
  highlightTaskId,
}: TaskMarkerDataLoadingManagerProps) => {
  const [isLoadingChunks, setIsLoadingChunks] = useState(false)
  const [chunksLoaded, setChunksLoaded] = useState(0)
  const [totalChunks, setTotalChunks] = useState(0)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Load and process task marker data
  useEffect(() => {
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
        const waitForReady = async (): Promise<maplibregl.GeoJSONSource | null> => {
          for (let i = 0; i < 180; i++) {
            if (signal.aborted || !map.current) return null

            if (!map.current.isStyleLoaded()) {
              await new Promise((resolve) => requestAnimationFrame(resolve))
              continue
            }

            const source = map.current.getSource(LAYER_IDS.source)
            if (source && source.type === 'geojson') {
              return source as maplibregl.GeoJSONSource
            }

            await new Promise((resolve) => requestAnimationFrame(resolve))
          }
          return null
        }

        const source = await waitForReady()

        if (!source) {
          setIsLoadingChunks(false)
          return
        }

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

                // Pass highlightTaskId to highlight the primary task
                // Don't pass hover/selection state to createFeatureCollection - we handle it via setFeatureState
                // This prevents data reloads on hover/selection changes
                const featureCollection = createFeatureCollection(
                  chunk,
                  overlaps,
                  highlightTaskId,
                  undefined,
                  undefined
                )

                allFeatures.push(...featureCollection.features)

                const finalFeatureCollection: GeoJSON.FeatureCollection = {
                  type: 'FeatureCollection',
                  features: allFeatures,
                }
                currentFeatureDataRef.current = finalFeatureCollection

                source.setData(finalFeatureCollection)

                // Set initial feature state after data is loaded
                // Note: The separate effect will handle hover/selection updates
                // We only set highlighted state here since it's part of the feature properties
                const mapInstance = map.current
                if (mapInstance) {
                  allFeatures.forEach((feature) => {
                    const taskId = feature.properties?.id
                    if (taskId !== undefined && feature.id !== undefined) {
                      const isHighlighted = feature.properties?.isHighlighted || false

                      try {
                        // Only set highlighted state here - hover/selection will be set by the separate effect
                        mapInstance.setFeatureState(
                          { source: LAYER_IDS.source, id: feature.id },
                          { hover: false, selected: false, highlighted: isHighlighted }
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
        dataRestoredRef.current = false
      } catch (error) {
        console.error('Error initializing task features:', error)
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
    sourceReady,
    dataRestoredRef,
    currentFeatureDataRef,
    highlightTaskId,
  ])

  return (
    <ChunkLoadingIndicator
      isVisible={isLoadingChunks}
      chunksLoaded={chunksLoaded}
      totalChunks={totalChunks}
    />
  )
}
