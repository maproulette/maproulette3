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
  selectedTaskIds?: number[]
  setSelectedTaskIds?: (taskIds: number[]) => void
  hoveredTaskId?: number | null
  setHoveredTaskId?: (taskId: number | null) => void
  onClusteringToggle?: (enabled: boolean) => void
  currentStyleId?: string
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
  selectedTaskIds = [],
  setSelectedTaskIds,
  hoveredTaskId: _hoveredTaskId,
  setHoveredTaskId,
  onClusteringToggle: _onClusteringToggle,
  currentStyleId,
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

  useEffect(() => {
    if (!map.current || !mapLoaded || !sourceReady) return

    const source = map.current.getSource(LAYER_IDS.source)
    if (!source || source.type !== 'geojson') return

    const geoJsonSource = source as maplibregl.GeoJSONSource
    const currentData = geoJsonSource._data as GeoJSON.FeatureCollection

    if (!currentData?.features) return

    let dataChanged = false

    currentData.features.forEach((feature) => {
      const taskId = feature.properties?.id
      if (taskId === undefined || feature.id === undefined) return

      const isSelected = selectedTaskIds.includes(taskId)
      const isHighlighted = feature.properties?.isHighlighted || false

      if (feature.properties?.isSelected !== isSelected) {
        if (feature.properties) {
          feature.properties.isSelected = isSelected
          dataChanged = true
        }
      }

      try {
        map.current?.setFeatureState(
          { source: LAYER_IDS.source, id: feature.id },
          { selected: isSelected, highlighted: isHighlighted }
        )
      } catch (_err) {}
    })

    if (dataChanged && map.current) {
      geoJsonSource.setData(currentData)
    }
  }, [selectedTaskIds, map, mapLoaded, sourceReady])

  useEffect(() => {
    if (lastStyleIdRef.current !== currentStyleId) {
      dataRestoredRef.current = false
      lastStyleIdRef.current = currentStyleId
    }
  }, [currentStyleId])

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

      if (currentFeatureDataRef.current) {
        dataRestoredRef.current = true
      }
    },
  })

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

                const featureCollection = createFeatureCollection(
                  chunk,
                  overlaps,
                  zoomToTaskId,
                  selectedTaskIds,
                  undefined
                )

                allFeatures.push(...featureCollection.features)

                const finalFeatureCollection: GeoJSON.FeatureCollection = {
                  type: 'FeatureCollection',
                  features: allFeatures,
                }
                currentFeatureDataRef.current = finalFeatureCollection

                source.setData(finalFeatureCollection)

                const mapInstance = map.current
                if (mapInstance) {
                  allFeatures.forEach((feature) => {
                    const taskId = feature.properties?.id
                    if (taskId !== undefined && feature.id !== undefined) {
                      const isSelected = selectedTaskIds.includes(taskId)
                      const isHighlighted = feature.properties?.isHighlighted || false

                      try {
                        mapInstance.setFeatureState(
                          { source: LAYER_IDS.source, id: feature.id },
                          { selected: isSelected, highlighted: isHighlighted }
                        )
                      } catch (_err) {}
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
