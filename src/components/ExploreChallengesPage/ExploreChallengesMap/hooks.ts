import { useQuery } from '@tanstack/react-query'
import type maplibregl from 'maplibre-gl'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MapRef } from 'react-map-gl/maplibre'
import { api } from '@/api'
import { addMapLayers } from '@/components/shared/TaskMarkers/addMapLayers'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import { createMarkerIcons } from '@/components/shared/TaskMarkers/createMarkerIcons'
import {
    handleClusterClick,
    setupEventListeners,
} from '@/components/shared/TaskMarkers/eventListeners'
import { detectOverlappingTasks } from '@/components/shared/TaskMarkers/overlapUtils'
import type { TaskCluster, TaskMarker } from '@/types/Task'
import { getStyleSpecification } from '@/utils/mapStyles'
import {
    fitMapToBounds,
    getMapBoundsString,
    isWorldBounds,
    parseBoundsString,
} from '@/utils/mapUtils'
import { useExploreChallengesSearchContext } from '../ExploreChallengesSearchContext'
import {
    calculateTaskCount,
    convertTaskMarkersToGeoJSON,
    isValidLocation,
    processMarkersData,
} from './utils'

export type PopupInfo =
  | { type: 'single'; task: TaskMarker }
  | { type: 'overlap'; tasks: TaskMarker[]; center: [number, number] }
  | null

export const useExploreChallengesMap = () => {
  const { taskMarkerParams, setBounds, cluster, setCluster, bounds } =
    useExploreChallengesSearchContext()
  const mapRef = useRef<MapRef | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [isStylePanelOpen, setIsStylePanelOpen] = useState(false)
  const [popupInfo, setPopupInfo] = useState<PopupInfo>(null)

  const boundsUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const initialBoundsAppliedRef = useRef(false)

  const { data: taskMarkersData, isLoading: isLoadingMarkers } = useQuery(
    api.task.getTaskMarkers(taskMarkerParams)
  )

  const defaultStyle = useMemo(() => {
    const styleSpec = getStyleSpecification('osm-us-vector')
    if (styleSpec) {
      return styleSpec as string | maplibregl.StyleSpecification
    }

    return 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
  }, [])

  const taskCount = useMemo(() => calculateTaskCount(taskMarkersData), [taskMarkersData])

  // Compute whether clustering should be active (temporarily overridden for 500+ tasks)
  const shouldCluster = useMemo(() => {
    // Clustering is temporarily enforced for 500+ tasks, regardless of user preference
    if (taskCount >= 500) {
      return true
    }
    // Otherwise use the user's preference
    return cluster
  }, [taskCount, cluster])

  // Automatically disable clustering when there are less than 100 tasks
  useEffect(() => {
    if (taskCount > 0 && taskCount < 100 && cluster) {
      setCluster(false)
    }
  }, [taskCount, cluster, setCluster])

  const markersData = useMemo(() => processMarkersData(taskMarkersData), [taskMarkersData])

  const geoJSONData = useMemo(() => {
    if (markersData.clusters.length > 0) {
      return convertTaskMarkersToGeoJSON(markersData.clusters as TaskCluster[])
    }
    if (markersData.markers.length > 0) {
      return convertTaskMarkersToGeoJSON(markersData.markers as TaskMarker[])
    }
    return {
      type: 'FeatureCollection',
      features: [],
    } as GeoJSON.FeatureCollection
  }, [markersData])

  const handleMapMoveEnd = useCallback(() => {
    if (!mapRef.current) return

    const map = mapRef.current.getMap()
    if (!map) return

    if (boundsUpdateTimeoutRef.current) {
      clearTimeout(boundsUpdateTimeoutRef.current)
    }

    boundsUpdateTimeoutRef.current = setTimeout(() => {
      const boundsString = getMapBoundsString(map)
      setBounds(boundsString)
    }, 300)
  }, [setBounds])

  // Apply initial bounds
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || initialBoundsAppliedRef.current) return

    const map = mapRef.current.getMap()
    if (!map) return

    if (bounds && !isWorldBounds(bounds)) {
      const parsedBounds = parseBoundsString(bounds)
      if (parsedBounds) {
        const [west, south, east, north] = parsedBounds

        fitMapToBounds(
          map,
          [
            [west, south],
            [east, north],
          ],
          {
            padding: 0,
            duration: 5000,
          }
        )
        initialBoundsAppliedRef.current = true
      }
    } else {
      initialBoundsAppliedRef.current = true
    }
  }, [mapLoaded, bounds])

  // Setup clustering layers
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !shouldCluster) return

    const map = mapRef.current.getMap()
    if (!map) return

    createMarkerIcons({ current: map })

    const sourceId = LAYER_IDS.source
    const existingSource = map.getSource(sourceId)

    const useClientSideClustering = false

    if (existingSource && existingSource.type === 'geojson') {
      ;(existingSource as maplibregl.GeoJSONSource).setData(geoJSONData)
    } else {
      map.addSource(sourceId, {
        type: 'geojson',
        data: geoJSONData,
        cluster: useClientSideClustering,
        clusterMaxZoom: 14,
        clusterRadius: 120,
      })
    }

    addMapLayers({ current: map }, { useTaskCountFilter: true })

    const cleanup = setupEventListeners({ current: map })

    return () => {
      cleanup()
      if (boundsUpdateTimeoutRef.current) {
        clearTimeout(boundsUpdateTimeoutRef.current)
      }
    }
  }, [mapLoaded, geoJSONData, shouldCluster])

  // Remove clustering layers when clustering is disabled
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || shouldCluster) return

    const map = mapRef.current.getMap()
    if (!map) return

    try {
      if (map.getLayer(LAYER_IDS.clusters)) map.removeLayer(LAYER_IDS.clusters)
      if (map.getLayer(LAYER_IDS.clusterCount)) map.removeLayer(LAYER_IDS.clusterCount)
      if (map.getLayer(LAYER_IDS.points)) map.removeLayer(LAYER_IDS.points)
      const highlightLayerId = `${LAYER_IDS.points}-highlight`
      if (map.getLayer(highlightLayerId)) map.removeLayer(highlightLayerId)
      const sourceId = LAYER_IDS.source
      if (map.getSource(sourceId)) map.removeSource(sourceId)
    } catch (_error) {
      // Error removing clustering layers
    }
  }, [mapLoaded, shouldCluster])

  const overlapData = useMemo(() => {
    if (shouldCluster) {
      return { overlaps: [], nonOverlapping: [] }
    }

    if (markersData.markers.length === 0) {
      return { overlaps: [], nonOverlapping: [] }
    }

    // Validate markers have valid locations
    const validMarkers = markersData.markers.filter((marker) => isValidLocation(marker.location))

    if (validMarkers.length === 0) {
      return { overlaps: [], nonOverlapping: [] }
    }

    const result = detectOverlappingTasks(validMarkers)

    return result
  }, [shouldCluster, markersData.markers])

  // Close popup if the marker/task is no longer in the data
  useEffect(() => {
    if (!popupInfo) return

    if (popupInfo.type === 'single') {
      // Check if the task still exists in the non-overlapping markers (what's actually rendered)
      const taskExists = overlapData.nonOverlapping.some((m) => m.id === popupInfo.task.id)
      if (!taskExists) {
        setPopupInfo(null)
      }
    } else if (popupInfo.type === 'overlap') {
      // Check if the overlap group still exists
      const overlapExists = overlapData.overlaps.some(
        (o) =>
          o.tasks.length === popupInfo.tasks.length &&
          o.tasks.every((t) => popupInfo.tasks.some((pt) => pt.id === t.id))
      )
      if (!overlapExists) {
        setPopupInfo(null)
      }
    }
  }, [popupInfo, overlapData.nonOverlapping, overlapData.overlaps])

  const handleMapClick = useCallback(
    (e: maplibregl.MapMouseEvent) => {
      if (shouldCluster && mapRef.current) {
        const map = mapRef.current.getMap()
        if (map) {
          handleClusterClick({ current: map }, e)
        }
      } else {
        setPopupInfo(null)
      }
    },
    [shouldCluster]
  )

  return {
    mapRef,
    mapLoaded,
    setMapLoaded,
    isStylePanelOpen,
    setIsStylePanelOpen,
    popupInfo,
    setPopupInfo,
    defaultStyle,
    taskCount,
    shouldCluster,
    markersData,
    overlapData,
    isLoadingMarkers,
    handleMapMoveEnd,
    handleMapClick,
    setCluster,
  }
}
