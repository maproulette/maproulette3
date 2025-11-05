import maplibregl from 'maplibre-gl'
import { useEffect, useRef, useState } from 'react'
import { useMapContext } from '@/contexts/MapContext'
import type { TaskMarker } from '@/types/Task'
import { ClusterToggle } from '../BrowsedChallengePage/ChallengesMap/ClusterToggle'
import { addMapLayers } from './addMapLayers'
import { ChunkLoadingIndicator } from './ChunkLoadingIndicator'
import { CLUSTER_CONFIG, LAYER_IDS } from './const'
import { createMarkerIcons } from './createMarkerIcons'
import { setupEventListeners } from './eventListeners'
import { useVisibleTaskCount } from './hooks/useVisibleTaskCount'
import { detectOverlappingTasks } from './overlapUtils'
import { createOptimalChunks } from './utils/dataChunking'
import { createFeatureCollection } from './utils/featureCreation'
import { cleanupLayers, cleanupPopups } from './utils/mapCleanup'

export const TaskMarkers = ({
  taskMarkers,
  isLoadingTaskMarkers,
  zoomToTaskId,
}: {
  taskMarkers: TaskMarker[] | undefined
  isLoadingTaskMarkers: boolean
  zoomToTaskId?: string
}) => {
  const { map, mapLoaded, clusteringEnabled, lastZoom } = useMapContext()
  const visibleTaskCount = useVisibleTaskCount(map, taskMarkers, mapLoaded)
  const zoomedOutTooFar = lastZoom < 9
  const taskCountTooMany = visibleTaskCount > 500
  const forceCluster = taskCountTooMany || zoomedOutTooFar
  const effectiveClusteringEnabled = forceCluster ? true : clusteringEnabled

  // Track chunk loading state
  const [isLoadingChunks, setIsLoadingChunks] = useState(false)
  const [chunksLoaded, setChunksLoaded] = useState(0)
  const [totalChunks, setTotalChunks] = useState(0)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!map.current || !taskMarkers || isLoadingTaskMarkers || !mapLoaded) return

    // Abort any ongoing chunk loading
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    // Start loading indicator immediately
    setIsLoadingChunks(true)

    // Use setTimeout to ensure React renders the loading indicator before processing
    const initializeProcessing = async () => {
      if (signal.aborted || !map.current) return

      // Break up initialization into async steps
      await new Promise((resolve) => setTimeout(resolve, 0))
      createMarkerIcons(map)

      await new Promise((resolve) => setTimeout(resolve, 0))
      cleanupLayers(map.current)
      cleanupPopups()

      await new Promise((resolve) => setTimeout(resolve, 0))
      // Split tasks into chunks for better performance
      const taskChunks = createOptimalChunks(taskMarkers)

      setTotalChunks(taskChunks.length)
      setChunksLoaded(0)

      // Accumulate all features across chunks
      const allFeatures: GeoJSON.Feature[] = []

      // Process chunks sequentially
      const processChunksSequentially = async () => {
        // Create initial empty source
        if (!map.current) return

        map.current.addSource(LAYER_IDS.source, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [],
          },
          cluster: effectiveClusteringEnabled,
          clusterMaxZoom: CLUSTER_CONFIG.maxZoom,
          clusterRadius: CLUSTER_CONFIG.radius,
        })

        // Add layers once (will show data as source is updated)
        addMapLayers(map)
        setupEventListeners(map)

        for (let chunkIndex = 0; chunkIndex < taskChunks.length; chunkIndex++) {
          // Check if aborted
          if (signal.aborted) {
            return
          }

          const chunk = taskChunks[chunkIndex]

          // Process chunk in next animation frame
          await new Promise<void>((resolve) => {
            requestAnimationFrame(() => {
              if (!map.current || signal.aborted) {
                resolve()
                return
              }

              try {
                // Skip expensive overlap detection for large chunks - it's too slow
                // Only detect overlaps for small chunks where it's actually useful
                const shouldDetectOverlaps = chunk.length < 2000
                const overlaps = shouldDetectOverlaps ? detectOverlappingTasks(chunk).overlaps : []
                const featureCollection = createFeatureCollection(chunk, overlaps, zoomToTaskId)

                // Add this chunk's features to accumulated features
                allFeatures.push(...featureCollection.features)

                // Update the single source with all features so far
                const source = map.current.getSource(LAYER_IDS.source)
                if (source && source.type === 'geojson') {
                  ;(source as maplibregl.GeoJSONSource).setData({
                    type: 'FeatureCollection',
                    features: allFeatures,
                  })
                }

                // Update progress
                setChunksLoaded(chunkIndex + 1)
              } catch (error) {
                console.error(`Error loading chunk ${chunkIndex}:`, error)
              }

              resolve()
            })
          })

          // No delay between chunks for smoother rendering
        }

        // All chunks loaded

        // Hide loading indicator
        setIsLoadingChunks(false)

        // Zoom to specific task or all markers after loading
        if (map.current && taskMarkers.length > 0) {
          if (zoomToTaskId) {
            // Zoom to specific task - convert both to strings for comparison
            const specificTask = taskMarkers.find(
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
                'Task not found in markers:',
                zoomToTaskId,
                'Available IDs:',
                taskMarkers.map((m) => m.id)
              )
            }
          } else {
            // Calculate bounds from all task markers
            const bounds = new maplibregl.LngLatBounds()
            taskMarkers.forEach((marker) => {
              bounds.extend([marker.location.lng, marker.location.lat])
            })

            // Fit map to bounds with padding
            map.current.fitBounds(bounds, {
              padding: { top: 50, bottom: 50, left: 50, right: 50 },
              duration: 1500,
            })
          }
        }
      }

      await processChunksSequentially()
    }

    setTimeout(() => {
      initializeProcessing()
    }, 0)

    return () => {
      // Abort ongoing chunk loading
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      cleanupPopups()
    }
  }, [map, mapLoaded, taskMarkers, isLoadingTaskMarkers, effectiveClusteringEnabled, zoomToTaskId])

  return (
    <>
      <ClusterToggle
        zoomedOutTooFar={zoomedOutTooFar}
        disabled={forceCluster}
        taskCount={visibleTaskCount}
        taskCountTooMany={taskCountTooMany}
      />
      <ChunkLoadingIndicator
        isVisible={isLoadingChunks}
        chunksLoaded={chunksLoaded}
        totalChunks={totalChunks}
      />
    </>
  )
}
