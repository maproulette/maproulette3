import { useNavigate, useSearch } from '@tanstack/react-router'
import type maplibregl from 'maplibre-gl'
import type { GeoJSONSource } from 'maplibre-gl'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MapMouseEvent, MapRef } from 'react-map-gl/maplibre'
import { api } from '@/api'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import { createMarkerIcons } from '@/components/shared/TaskMarkers/createMarkerIcons'
import { detectOverlappingTasks } from '@/components/shared/TaskMarkers/overlapUtils'
import type { TaskMarker } from '@/types/Task'
import { getStyleSpecification } from '@/utils/mapStyles'
import {
  boundsAreEqual,
  fitMapToBounds,
  getMapBoundsString,
  isWorldBounds,
  parseBoundsString,
} from '@/utils/mapUtils'
import { useBrowsedChallengeContext } from '../contexts/BrowsedChallengeContext'
import type { PopupInfo } from './types'
import {
  calculateTaskCount,
  convertTaskMarkersToGeoJSON,
  isValidLocation,
  processMarkersData,
} from './utils'

export { clusterLayer } from './clusterLayers'

export type { PopupInfo } from './types'

export const useBrowseChallengeMap = () => {
  const { challenge } = useBrowsedChallengeContext()
  const { bounds: initialBounds } = useSearch({ from: '/_app/challenge/$challengeId/' })
  const navigate = useNavigate()
  const mapRef = useRef<MapRef | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [isStylePanelOpen, setIsStylePanelOpen] = useState(false)
  const [popupInfo, setPopupInfo] = useState<PopupInfo>(null)
  const [cluster, setCluster] = useState<boolean>(true)
  const initialBoundsAppliedRef = useRef(false)
  const boundsUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastAppliedBoundsRef = useRef<string | null>(null)

  const { data: taskMarkersData, isLoading: isLoadingMarkers } =
    api.challenge.getChallengeTaskMarkers(challenge.id)

  const taskCount = useMemo(() => calculateTaskCount(taskMarkersData), [taskMarkersData])

  const markersData = useMemo(() => processMarkersData(taskMarkersData), [taskMarkersData])

  const shouldCluster = useMemo(() => {
    return cluster
  }, [cluster])

  const geoJSONData = useMemo(() => {
    if (markersData.markers.length > 0) {
      return convertTaskMarkersToGeoJSON(markersData.markers as TaskMarker[])
    }
    return {
      type: 'FeatureCollection',
      features: [],
    } as GeoJSON.FeatureCollection
  }, [markersData.markers])

  const overlapData = useMemo(() => {
    if (shouldCluster) {
      return { overlaps: [], nonOverlapping: [] }
    }

    if (markersData.markers.length === 0) {
      return { overlaps: [], nonOverlapping: [] }
    }

    const validMarkers = markersData.markers.filter((marker) => isValidLocation(marker.location))

    if (validMarkers.length === 0) {
      return { overlaps: [], nonOverlapping: [] }
    }

    const result = detectOverlappingTasks(validMarkers)

    return result
  }, [shouldCluster, markersData.markers])

  const defaultStyle = useMemo(() => {
    const styleSpec = getStyleSpecification('osm-us-vector')
    if (styleSpec) {
      return styleSpec as string | maplibregl.StyleSpecification
    }
    return 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
  }, [])

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !shouldCluster) return

    const map = mapRef.current.getMap()
    if (!map) return

    createMarkerIcons({ current: map })
  }, [mapLoaded, shouldCluster, mapRef])

  // Calculate bounds for all task markers
  const allTagsBounds = useMemo(() => {
    if (!geoJSONData || geoJSONData.features.length === 0) return null

    const coordinates: [number, number][] = []

    geoJSONData.features.forEach((feature) => {
      if (feature.geometry.type === 'Point') {
        const [lng, lat] = feature.geometry.coordinates
        coordinates.push([lng, lat])
      } else if (feature.geometry.type === 'MultiPoint') {
        feature.geometry.coordinates.forEach((coord) => {
          const [lng, lat] = coord
          coordinates.push([lng, lat])
        })
      }
    })

    if (coordinates.length === 0) return null

    const lngs = coordinates.map((c) => c[0])
    const lats = coordinates.map((c) => c[1])
    const west = Math.min(...lngs)
    const east = Math.max(...lngs)
    const south = Math.min(...lats)
    const north = Math.max(...lats)

    if (west === east && south === north) return null

    return [
      [west, south],
      [east, north],
    ] as [[number, number], [number, number]]
  }, [geoJSONData])

  // Handle map move end - update URL bounds
  const handleMapMoveEnd = useCallback(() => {
    if (!mapRef.current) return

    const map = mapRef.current.getMap()
    if (!map) return

    if (boundsUpdateTimeoutRef.current) {
      clearTimeout(boundsUpdateTimeoutRef.current)
    }

    boundsUpdateTimeoutRef.current = setTimeout(() => {
      const boundsString = getMapBoundsString(map)

      // Only update bounds if they've changed significantly (beyond floating point precision)
      if (
        !lastAppliedBoundsRef.current ||
        !boundsAreEqual(boundsString, lastAppliedBoundsRef.current)
      ) {
        navigate({
          to: '/challenge/$challengeId',
          params: { challengeId: String(challenge.id) },
          search: (prev) => ({
            ...prev,
            bounds: boundsString && !isWorldBounds(boundsString) ? boundsString : undefined,
          }),
          replace: true,
        })
        lastAppliedBoundsRef.current = boundsString
      }
    }, 300)
  }, [challenge.id, navigate])

  // Load initial bounds from URL or fit to all tags
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || initialBoundsAppliedRef.current) return

    const map = mapRef.current.getMap()
    if (!map) return

    // If URL has bounds, use those
    if (initialBounds && !isWorldBounds(initialBounds)) {
      const parsedBounds = parseBoundsString(initialBounds)
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
            duration: 1000,
          }
        )
        lastAppliedBoundsRef.current = initialBounds
        initialBoundsAppliedRef.current = true
        return
      }
    }

    // Otherwise, fit to all tags
    if (allTagsBounds) {
      fitMapToBounds(map, allTagsBounds, {
        padding: 50,
        duration: 1000,
      })
      initialBoundsAppliedRef.current = true
    } else {
      initialBoundsAppliedRef.current = true
    }
  }, [mapLoaded, initialBounds, allTagsBounds, mapRef])

  // Zoom to all tags function
  const zoomToAllTags = useCallback(() => {
    if (!mapRef.current || !allTagsBounds) return

    const map = mapRef.current.getMap()
    if (!map) return

    fitMapToBounds(map, allTagsBounds, {
      padding: 50,
      duration: 1000,
    })
  }, [allTagsBounds])

  const handleMapClick = useCallback(
    async (e: MapMouseEvent) => {
      if (shouldCluster && mapRef.current) {
        const feature = e.features?.[0]
        if (!feature) {
          setPopupInfo(null)
          return
        }

        const map = mapRef.current.getMap()
        if (!map) return

        const isClientSideCluster =
          feature.properties?.cluster_id !== undefined ||
          feature.properties?.point_count !== undefined
        const isUnclusteredPoint = feature.properties?.id !== undefined && !isClientSideCluster

        if (isClientSideCluster && feature.geometry.type === 'Point') {
          const coordinates = feature.geometry.coordinates as [number, number]
          const geojsonSource = map.getSource(LAYER_IDS.source) as GeoJSONSource

          if (geojsonSource) {
            try {
              const clusterId = feature.properties.cluster_id
              if (clusterId !== undefined) {
                const zoom = await geojsonSource.getClusterExpansionZoom(clusterId)
                mapRef.current.easeTo({
                  center: coordinates,
                  zoom: Math.min(zoom, map.getMaxZoom()),
                  duration: 500,
                })
              }
            } catch (error) {
              console.warn('Failed to expand cluster:', error)

              const currentZoom = map.getZoom()
              mapRef.current.easeTo({
                center: coordinates,
                zoom: Math.min(currentZoom + 2, map.getMaxZoom()),
                duration: 500,
              })
            }
          }
        } else if (isUnclusteredPoint && feature.geometry.type === 'Point') {
          const taskId = feature.properties.id as number
          const task = markersData.markers.find((m) => m.id === taskId)
          if (task) {
            setPopupInfo({ type: 'single', task })
          }
        } else {
          setPopupInfo(null)
        }
      } else {
        setPopupInfo(null)
      }
    },
    [shouldCluster, markersData.markers]
  )

  const handleMapMouseMove = useCallback(
    (e: MapMouseEvent) => {
      if (!mapRef.current) return

      const map = mapRef.current.getMap()
      if (!map) return

      const layersToQuery: string[] = []
      if (shouldCluster) {
        if (map.getLayer(LAYER_IDS.clusters)) {
          layersToQuery.push(LAYER_IDS.clusters)
        }
        if (map.getLayer(LAYER_IDS.clusterCount)) {
          layersToQuery.push(LAYER_IDS.clusterCount)
        }
        if (map.getLayer(LAYER_IDS.points)) {
          layersToQuery.push(LAYER_IDS.points)
        }
      } else {
        if (map.getLayer(LAYER_IDS.points)) {
          layersToQuery.push(LAYER_IDS.points)
        }
      }

      if (layersToQuery.length === 0) {
        map.getCanvas().style.cursor = ''
        return
      }

      const features = map.queryRenderedFeatures(e.point, {
        layers: layersToQuery,
      })

      if (features && features.length > 0) {
        const feature = features[0]
        const isCluster =
          feature.properties?.cluster_id !== undefined ||
          feature.properties?.point_count !== undefined
        const isMarker =
          feature.layer?.id === LAYER_IDS.points ||
          feature.layer?.id === LAYER_IDS.clusters ||
          feature.layer?.id === LAYER_IDS.clusterCount

        if (isCluster || isMarker) {
          map.getCanvas().style.cursor = 'pointer'
        } else {
          map.getCanvas().style.cursor = ''
        }
      } else {
        map.getCanvas().style.cursor = ''
      }
    },
    [shouldCluster]
  )

  useEffect(() => {
    if (!popupInfo) return

    if (shouldCluster) {
      if (popupInfo.type === 'single') {
        const taskExists = markersData.markers.some((m) => m.id === popupInfo.task.id)
        if (!taskExists) {
          setPopupInfo(null)
        }
      }
    } else {
      if (popupInfo.type === 'single') {
        const taskExists = overlapData.nonOverlapping.some((m) => m.id === popupInfo.task.id)
        if (!taskExists) {
          setPopupInfo(null)
        }
      } else if (popupInfo.type === 'overlap') {
        const overlapExists = overlapData.overlaps.some(
          (o) =>
            o.tasks.length === popupInfo.tasks.length &&
            o.tasks.every((t) => popupInfo.tasks.some((pt) => pt.id === t.id))
        )
        if (!overlapExists) {
          setPopupInfo(null)
        }
      }
    }
  }, [
    popupInfo,
    shouldCluster,
    markersData.markers,
    overlapData.nonOverlapping,
    overlapData.overlaps,
  ])

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
    handleMapClick,
    handleMapMouseMove,
    handleMapMoveEnd,
    setCluster,
    geoJSONData,
    zoomToAllTags,
    hasAllTagsBounds: allTagsBounds !== null,
  }
}
