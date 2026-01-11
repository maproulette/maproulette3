import maplibregl from 'maplibre-gl'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ChunkLoadingIndicator } from '@/components/shared/TaskMarkers/ChunkLoadingIndicator'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import { useTaskMarkerSetup } from '@/components/shared/TaskMarkers/hooks/useTaskMarkerSetup'
import { useVisibleTaskCount } from '@/components/shared/TaskMarkers/hooks/useVisibleTaskCount'
import { detectOverlappingTasks } from '@/components/shared/TaskMarkers/overlapUtils'
import { createFeatureCollection } from '@/components/shared/TaskMarkers/utils/featureCreation'
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

  useEffect(() => {
    if (!map.current || !mapLoaded || !filteredTaskMarkers) return

    const source = map.current.getSource(LAYER_IDS.source)
    if (!source || source.type !== 'geojson') return

    const geoJsonSource = source as maplibregl.GeoJSONSource
    const currentData = geoJsonSource._data as GeoJSON.FeatureCollection

    if (!currentData?.features) return

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
  }, [hoveredTaskId, selectedTaskIds, filteredTaskMarkers, map, mapLoaded])

  useTaskMarkerSetup({
    map,
    mapLoaded,
    taskMarkers: filteredTaskMarkers,
    clusteringEnabled,
    isLoading: isLoadingTaskMarkers,
    includeHighlight: true,
  })

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

      try {
        await new Promise((resolve) => setTimeout(resolve, 0))

        const source = map.current.getSource(LAYER_IDS.source)
        if (source && source.type === 'geojson') {
          const geoJsonSource = source as maplibregl.GeoJSONSource
          geoJsonSource.setData({
            type: 'FeatureCollection',
            features: [],
          })
        }

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

                const source = map.current.getSource(LAYER_IDS.source)
                if (source && source.type === 'geojson') {
                  ;(source as maplibregl.GeoJSONSource).setData({
                    type: 'FeatureCollection',
                    features: allFeatures,
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
  ])

  return (
    <ChunkLoadingIndicator
      isVisible={isLoadingChunks}
      chunksLoaded={chunksLoaded}
      totalChunks={totalChunks}
    />
  )
}
