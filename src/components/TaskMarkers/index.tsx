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
  const { map, mapLoaded, clusteringEnabled } = useMapContext()
  const visibleTaskCount = useVisibleTaskCount(map, taskMarkers, mapLoaded)
  const effectiveClusteringEnabled = clusteringEnabled

  const [isLoadingChunks, setIsLoadingChunks] = useState(false)
  const [chunksLoaded, setChunksLoaded] = useState(0)
  const [totalChunks, setTotalChunks] = useState(0)
  const abortControllerRef = useRef<AbortController | null>(null)
  const hasZoomedRef = useRef(false)
  const lastZoomToTaskIdRef = useRef(zoomToTaskId)

  if (lastZoomToTaskIdRef.current !== zoomToTaskId) {
    lastZoomToTaskIdRef.current = zoomToTaskId
    hasZoomedRef.current = false
  }

  useEffect(() => {
    if (!map.current || !taskMarkers || isLoadingTaskMarkers || !mapLoaded) return

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    setIsLoadingChunks(true)

    const initializeProcessing = async () => {
      if (signal.aborted || !map.current) return

      await new Promise((resolve) => setTimeout(resolve, 0))
      createMarkerIcons(map)

      await new Promise((resolve) => setTimeout(resolve, 0))
      cleanupLayers(map.current)
      cleanupPopups()

      await new Promise((resolve) => setTimeout(resolve, 0))

      const taskChunks = createOptimalChunks(taskMarkers)

      setTotalChunks(taskChunks.length)
      setChunksLoaded(0)

      const allFeatures: GeoJSON.Feature[] = []

      const processChunksSequentially = async () => {
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

        addMapLayers(map)
        setupEventListeners(map)

        for (let chunkIndex = 0; chunkIndex < taskChunks.length; chunkIndex++) {
          if (signal.aborted) {
            return
          }

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
                const featureCollection = createFeatureCollection(chunk, overlaps, zoomToTaskId)

                allFeatures.push(...featureCollection.features)

                const source = map.current.getSource(LAYER_IDS.source)
                if (source && source.type === 'geojson') {
                  ;(source as maplibregl.GeoJSONSource).setData({
                    type: 'FeatureCollection',
                    features: allFeatures,
                  })
                }

                setChunksLoaded(chunkIndex + 1)
              } catch (error) {
                console.error(`Error loading chunk ${chunkIndex}:`, error)
              }

              resolve()
            })
          })
        }

        setIsLoadingChunks(false)

        if (map.current && taskMarkers.length > 0 && !hasZoomedRef.current) {
          hasZoomedRef.current = true

          if (zoomToTaskId) {
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
            const bounds = new maplibregl.LngLatBounds()
            taskMarkers.forEach((marker) => {
              bounds.extend([marker.location.lng, marker.location.lat])
            })

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
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      cleanupPopups()
    }
  }, [map, mapLoaded, taskMarkers, isLoadingTaskMarkers, effectiveClusteringEnabled, zoomToTaskId])

  return (
    <>
      <ClusterToggle disabled={false} taskCount={visibleTaskCount} />
      <ChunkLoadingIndicator
        isVisible={isLoadingChunks}
        chunksLoaded={chunksLoaded}
        totalChunks={totalChunks}
      />
    </>
  )
}
