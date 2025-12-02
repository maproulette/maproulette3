import maplibregl from 'maplibre-gl'
import { useEffect, useMemo, useRef, useState } from 'react'
import { addMapLayers } from '@/components/shared/TaskMarkers/addMapLayers'
import { CLUSTER_CONFIG, LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import { createMarkerIcons } from '@/components/shared/TaskMarkers/createMarkerIcons'
import { setupEventListeners } from '@/components/shared/TaskMarkers/eventListeners'
import { useVisibleTaskCount } from '@/components/shared/TaskMarkers/hooks/useVisibleTaskCount'
import { detectOverlappingTasks } from '@/components/shared/TaskMarkers/overlapUtils'
import { createFeatureCollection } from '@/components/shared/TaskMarkers/utils/featureCreation'
import { cleanupLayers, cleanupPopups } from '@/components/shared/TaskMarkers/utils/mapCleanup'
import { useMapContext } from '@/contexts/MapContext'
import type { TaskMarker } from '@/types/Task'
import { ClusterToggle } from '../BrowsedChallengePage/ChallengesMap/ClusterToggle'
import { ChunkLoadingIndicator } from './ChunkLoadingIndicator'
import { createOptimalChunks } from './utils/dataChunking'

export const TaskMarkers = ({
  taskMarkers,
  isLoadingTaskMarkers,
  zoomToTaskId,
  visibleTaskIds,
}: {
  taskMarkers: TaskMarker[] | undefined
  isLoadingTaskMarkers: boolean
  zoomToTaskId?: string
  visibleTaskIds?: number[]
}) => {
  const { map, mapLoaded, clusteringEnabled, hoveredTaskId, selectedTaskIds, setSelectedTaskIds } =
    useMapContext()

  // Filter task markers based on visibleTaskIds if bundle filtering is active
  const filteredTaskMarkers = useMemo(() => {
    if (!taskMarkers) return undefined
    if (!visibleTaskIds || visibleTaskIds.length === 0) return taskMarkers
    return taskMarkers.filter((marker) => visibleTaskIds.includes(marker.id))
  }, [taskMarkers, visibleTaskIds])

  const visibleTaskCount = useVisibleTaskCount(map, filteredTaskMarkers, mapLoaded)
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
    if (zoomToTaskId) {
      const taskId = Number(zoomToTaskId)
      if (!Number.isNaN(taskId) && !selectedTaskIds.includes(taskId)) {
        setSelectedTaskIds([taskId])
      }
    }
  }, [zoomToTaskId])

  useEffect(() => {
    if (!map.current || !mapLoaded || !filteredTaskMarkers) return

    const source = map.current.getSource(LAYER_IDS.source)
    if (!source || source.type !== 'geojson') return

    const geoJsonSource = source as maplibregl.GeoJSONSource
    // biome-ignore lint/suspicious/noExplicitAny: Accessing internal _data property of GeoJSONSource
    const currentData = (geoJsonSource as any)._data as GeoJSON.FeatureCollection

    if (!currentData || !currentData.features) return

    const updatedFeatures = currentData.features.map((feature) => {
      const taskId = feature.properties?.id
      const isHovered = hoveredTaskId !== null && taskId === hoveredTaskId
      const isSelected = selectedTaskIds.includes(taskId)
      const isHighlighted = feature.properties?.isHighlighted || false

      return {
        ...feature,
        properties: {
          ...feature.properties,
          isHovered,
          isSelected,
          isHighlighted,
        },
      }
    })

    geoJsonSource.setData({
      type: 'FeatureCollection',
      features: updatedFeatures,
    })
  }, [hoveredTaskId, selectedTaskIds, filteredTaskMarkers])

  useEffect(() => {
    if (!map.current || !filteredTaskMarkers || isLoadingTaskMarkers || !mapLoaded) return

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

      const taskChunks = createOptimalChunks(filteredTaskMarkers)

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
                const featureCollection = createFeatureCollection(
                  chunk,
                  overlaps,
                  zoomToTaskId,
                  selectedTaskIds,
                  hoveredTaskId
                )

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
                'Task not found in markers:',
                zoomToTaskId,
                'Available IDs:',
                filteredTaskMarkers.map((m) => m.id)
              )
            }
          } else {
            const bounds = new maplibregl.LngLatBounds()
            filteredTaskMarkers.forEach((marker) => {
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
  }, [
    map,
    mapLoaded,
    filteredTaskMarkers,
    isLoadingTaskMarkers,
    effectiveClusteringEnabled,
    zoomToTaskId,
  ])

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
