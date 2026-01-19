import maplibregl from 'maplibre-gl'
import { useEffect, useRef, useState } from 'react'
import { ChunkLoadingIndicator } from '@/components/shared/TaskMarkers/ChunkLoadingIndicator'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import { useTaskMarkerSetup } from '@/components/shared/TaskMarkers/hooks/useTaskMarkerSetup'
import { useVisibleTaskCount } from '@/components/shared/TaskMarkers/hooks/useVisibleTaskCount'
import { detectOverlappingTasks } from '@/components/shared/TaskMarkers/overlapUtils'
import { createFeatureCollection } from '@/components/shared/TaskMarkers/utils/featureCreation'
import { cleanupPopups } from '@/components/shared/TaskMarkers/utils/mapCleanup'
import type { TaskMarker } from '@/types/Task'
import { createOptimalChunks } from '@/utils/dataChunking'

export interface ChallengeTaskMarkersProps {
  taskMarkers: TaskMarker[] | undefined
  isLoadingTaskMarkers: boolean
  map: React.RefObject<maplibregl.Map | null>
  mapLoaded: boolean
  clusteringEnabled?: boolean
  onClusteringToggle?: (enabled: boolean) => void
  currentStyleId?: string
  showTaskFeatures?: boolean
}

export const ChallengeTaskMarkers = ({
  taskMarkers,
  isLoadingTaskMarkers,
  map,
  mapLoaded,
  clusteringEnabled = true,
  onClusteringToggle: _onClusteringToggle,
  currentStyleId,
  showTaskFeatures = true,
}: ChallengeTaskMarkersProps) => {
  useVisibleTaskCount(map, taskMarkers, mapLoaded)

  const [isLoadingChunks, setIsLoadingChunks] = useState(false)
  const [chunksLoaded, setChunksLoaded] = useState(0)
  const [totalChunks, setTotalChunks] = useState(0)
  const abortControllerRef = useRef<AbortController | null>(null)
  const currentFeatureDataRef = useRef<GeoJSON.FeatureCollection | null>(null)

  const [sourceReady, setSourceReady] = useState(false)
  const lastStyleIdRef = useRef(currentStyleId)
  const dataRestoredRef = useRef(false)

  // Set up the map source and layers
  useTaskMarkerSetup({
    map,
    mapLoaded,
    taskMarkers,
    clusteringEnabled,
    isLoading: isLoadingTaskMarkers,
    styleId: currentStyleId,
    includeHighlight: false,
    onSetupComplete: () => {
      setSourceReady(true)
      if (currentFeatureDataRef.current) {
        dataRestoredRef.current = true
      }
    },
    restoreData: currentFeatureDataRef.current,
  })

  useEffect(() => {
    if (lastStyleIdRef.current !== currentStyleId) {
      dataRestoredRef.current = false
      lastStyleIdRef.current = currentStyleId
    }
  }, [currentStyleId])

  useEffect(() => {
    setSourceReady(false)
  }, [currentStyleId])

  useEffect(() => {
    if (!map.current || !mapLoaded) return

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
          } catch (_error) {}
        }
      })

      const highlightLayerId = `${LAYER_IDS.points}-highlight`
      const highlightLayer = map.current?.getLayer(highlightLayerId)
      if (highlightLayer) {
        try {
          map.current?.setLayoutProperty(highlightLayerId, 'visibility', visibility)
        } catch (_error) {}
      }
    }

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
    if (dataRestoredRef.current && currentFeatureDataRef.current) {
      return
    }

    if (!map.current || !taskMarkers || isLoadingTaskMarkers || !mapLoaded || !sourceReady) {
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

        const taskChunks = createOptimalChunks(taskMarkers)
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
                  undefined,
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

        // Fit bounds to show all task markers
        if (map.current && taskMarkers.length > 0) {
          const bounds = new maplibregl.LngLatBounds()
          taskMarkers.forEach((marker) => {
            bounds.extend([marker.location.lng, marker.location.lat])
          })

          if (!bounds.isEmpty()) {
            map.current.fitBounds(bounds, {
              padding: { top: 50, bottom: 50, left: 50, right: 50 },
              duration: 1500,
            })
          }
        }
      } catch (error) {
        console.error('Error initializing challenge task markers:', error)
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
    taskMarkers,
    isLoadingTaskMarkers,
    clusteringEnabled,
    currentStyleId,
    sourceReady,
  ])

  // Cleanup popups on unmount
  useEffect(() => {
    return () => {
      cleanupPopups()
    }
  }, [])

  return (
    <ChunkLoadingIndicator
      isVisible={isLoadingChunks}
      chunksLoaded={chunksLoaded}
      totalChunks={totalChunks}
    />
  )
}
