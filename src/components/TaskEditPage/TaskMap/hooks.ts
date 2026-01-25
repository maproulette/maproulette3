import { useQuery } from '@tanstack/react-query'
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
import { fitMapToBounds } from '@/utils/mapUtils'
import { useTaskContext } from '../contexts/TaskContext'
import type { PopupInfo } from './types'
import { createSpiderGroup, detectVisualOverlaps } from './spiderUtils'
import {
  calculateTaskCount,
  convertTaskMarkersToGeoJSON,
  isValidLocation,
  processMarkersData,
} from './utils'

/**
 * Extracts and normalizes geometries from a task
 */
const extractGeometries = (
  task: { geometries?: string | unknown } | null
): GeoJSON.FeatureCollection | null => {
  if (!task?.geometries) return null

  try {
    const geometries =
      typeof task.geometries === 'string' ? JSON.parse(task.geometries) : task.geometries

    if (geometries.type === 'FeatureCollection' && geometries.features) {
      return geometries as GeoJSON.FeatureCollection
    }

    if (geometries.type === 'Feature') {
      return {
        type: 'FeatureCollection',
        features: [geometries],
      }
    }

    if (geometries.type && geometries.coordinates) {
      return {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: geometries,
            properties: {},
          },
        ],
      }
    }

    return null
  } catch (error) {
    console.error('Failed to parse task geometries:', error)
    return null
  }
}

/**
 * Calculates bounding box from GeoJSON geometries
 * Returns [[west, south], [east, north]] or null if no valid geometries
 */
const calculateBoundingBox = (
  geometries: GeoJSON.FeatureCollection | null
): [[number, number], [number, number]] | null => {
  if (!geometries || !geometries.features || geometries.features.length === 0) {
    return null
  }

  let minLng = Infinity
  let maxLng = -Infinity
  let minLat = Infinity
  let maxLat = -Infinity

  const processCoordinates = (coords: unknown): void => {
    if (Array.isArray(coords)) {
      if (coords.length >= 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
       
        const [lng, lat] = coords
       
        if (Number.isFinite(lng) && Number.isFinite(lat)) {
          minLng = Math.min(minLng, lng)
          maxLng = Math.max(maxLng, lng)
          minLat = Math.min(minLat, lat)
          maxLat = Math.max(maxLat, lat)
        }
      } else {
       
        coords.forEach(processCoordinates)
      }
    }
  }

  geometries.features.forEach((feature) => {
    if (feature.geometry) {
      const geom = feature.geometry
      if (geom.type === 'Point' && geom.coordinates) {
        processCoordinates(geom.coordinates)
      } else if (geom.type === 'LineString' && geom.coordinates) {
        processCoordinates(geom.coordinates)
      } else if (geom.type === 'Polygon' && geom.coordinates) {
        processCoordinates(geom.coordinates)
      } else if (geom.type === 'MultiPoint' && geom.coordinates) {
        processCoordinates(geom.coordinates)
      } else if (geom.type === 'MultiLineString' && geom.coordinates) {
        processCoordinates(geom.coordinates)
      } else if (geom.type === 'MultiPolygon' && geom.coordinates) {
        processCoordinates(geom.coordinates)
      }
    }
  })

  if (
    !Number.isFinite(minLng) ||
    !Number.isFinite(maxLng) ||
    !Number.isFinite(minLat) ||
    !Number.isFinite(maxLat)
  ) {
    return null
  }

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ]
}

export { clusterLayer } from './clusterLayers'

export const useTaskEditMap = (
  showBundleOnly?: boolean,
  activeBundle?: { bundleId: number; taskIds: number[] } | null
) => {
  const { task } = useTaskContext()
  const mapRef = useRef<MapRef | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [isStylePanelOpen, setIsStylePanelOpen] = useState(false)
  const [popupInfo, setPopupInfo] = useState<PopupInfo>(null)
  const [cluster, setCluster] = useState<boolean>(true)
  const [spideredMarkers, setSpideredMarkers] = useState<
    Map<number, { original: [number, number]; spidered: [number, number] }>
  >(new Map())
  const initialBoundsAppliedRef = useRef(false)
  const primaryTaskId = task.id
  const challengeId = task.parent

  const { data: taskMarkersData, isLoading: isLoadingMarkers } = useQuery(
    api.challenge.getChallengeTaskMarkers(challengeId)
  )

 
  const { data: fullTaskData } = useQuery(api.task.getTask(primaryTaskId))

  const taskCount = useMemo(() => calculateTaskCount(taskMarkersData), [taskMarkersData])

  const markersData = useMemo(() => processMarkersData(taskMarkersData), [taskMarkersData])

  const shouldCluster = useMemo(() => {
    return cluster
  }, [cluster])

 
  const bundleTaskIdsSet = useMemo(() => {
    return new Set(activeBundle?.taskIds ?? [])
  }, [])

 
  const overlapData = useMemo(() => {
    if (shouldCluster) {
      return { overlaps: [], nonOverlapping: [] }
    }

    let markersToUse = markersData.markers

   
    if (showBundleOnly && bundleTaskIdsSet.size > 0) {
      markersToUse = markersData.markers.filter(
        (marker) => marker.id === primaryTaskId || bundleTaskIdsSet.has(marker.id)
      )
    }

    if (markersToUse.length === 0) {
      return { overlaps: [], nonOverlapping: [] }
    }

    const validMarkers = markersToUse.filter((marker) => isValidLocation(marker.location))

    if (validMarkers.length === 0) {
      return { overlaps: [], nonOverlapping: [] }
    }

    const result = detectOverlappingTasks(validMarkers)

    return result
  }, [shouldCluster, markersData.markers, showBundleOnly, bundleTaskIdsSet, primaryTaskId])

 
  const overlappingTaskIds = useMemo(() => {
    if (shouldCluster || overlapData.overlaps.length === 0) {
      return new Set<number>()
    }
    const ids = new Set<number>()
    overlapData.overlaps.forEach((overlap) => {
      overlap.tasks.forEach((task) => {
        ids.add(task.id)
      })
    })
    return ids
  }, [shouldCluster, overlapData.overlaps])

 
  // Create a lookup map from overlapId to overlap data for click handling
  const overlapGroupsMap = useMemo(() => {
    const map = new Map<string, { center: [number, number]; tasks: TaskMarker[] }>()
    if (!shouldCluster) {
      overlapData.overlaps.forEach((overlap) => {
        map.set(overlap.id, { center: overlap.center, tasks: overlap.tasks })
      })
    }
    return map
  }, [shouldCluster, overlapData.overlaps])

  const geoJSONData = useMemo(() => {
    let markersToUse = markersData.markers

    if (showBundleOnly && bundleTaskIdsSet.size > 0) {
      markersToUse = markersData.markers.filter(
        (marker) => marker.id === primaryTaskId || bundleTaskIdsSet.has(marker.id)
      )
    }

    // When not clustering, filter out overlapping tasks (they'll be represented by overlap markers)
    let nonOverlappingMarkers = markersToUse
    if (!shouldCluster && overlappingTaskIds.size > 0) {
      nonOverlappingMarkers = markersToUse.filter((marker) => !overlappingTaskIds.has(marker.id))
    }

    // Convert non-overlapping markers to GeoJSON
    const baseGeoJSON = nonOverlappingMarkers.length > 0
      ? convertTaskMarkersToGeoJSON(nonOverlappingMarkers as TaskMarker[])
      : { type: 'FeatureCollection' as const, features: [] }

    // Add overlap marker features when not clustering
    if (!shouldCluster && overlapData.overlaps.length > 0) {
      const overlapFeatures = overlapData.overlaps.map((overlap) => {
        // Check if any task in the overlap is primary or bundled
        const hasPrimary = overlap.tasks.some((t) => t.id === primaryTaskId)
        const hasBundled = overlap.tasks.some((t) => bundleTaskIdsSet.has(t.id))
        const isHighlighted = hasPrimary || hasBundled

        return {
          type: 'Feature' as const,
          properties: {
            id: overlap.tasks[0].id, // Use first task's ID for feature identification
            overlapId: overlap.id,
            isOverlapping: true,
            overlapTaskCount: overlap.tasks.length,
            isHighlighted,
            isSelected: false,
            isLassoSelected: false,
            isHovered: false,
            status: 0,
            priority: 0,
            difficulty: 1,
          },
          geometry: {
            type: 'Point' as const,
            coordinates: overlap.center,
          },
        }
      })

      return {
        type: 'FeatureCollection' as const,
        features: [...baseGeoJSON.features, ...overlapFeatures],
      } as GeoJSON.FeatureCollection
    }

    return baseGeoJSON as GeoJSON.FeatureCollection
  }, [
    markersData.markers,
    primaryTaskId,
    showBundleOnly,
    bundleTaskIdsSet,
    shouldCluster,
    overlappingTaskIds,
    overlapData.overlaps,
  ])

  const defaultStyle = useMemo(() => {
    const styleSpec = getStyleSpecification('osm-us-vector')
    if (styleSpec) {
      return styleSpec as string | maplibregl.StyleSpecification
    }
    return 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
  }, [])

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return

    const map = mapRef.current.getMap()
    if (!map) return

    // Create/recreate marker icons - also re-run when clustering state changes
    // to ensure icons are available for the new source
    createMarkerIcons({ current: map })
  }, [mapLoaded, mapRef, shouldCluster])

 
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || initialBoundsAppliedRef.current) return
    if (isLoadingMarkers) return

    const map = mapRef.current.getMap()
    if (!map) return

   
    const taskWithGeometries = (fullTaskData as typeof task | undefined) || task
    const geometries = extractGeometries(taskWithGeometries)
    const bounds = calculateBoundingBox(geometries)

    if (bounds) {
     
      const [[west, south], [east, north]] = bounds
      if (
        Number.isFinite(west) &&
        Number.isFinite(south) &&
        Number.isFinite(east) &&
        Number.isFinite(north) &&
        !Number.isNaN(west) &&
        !Number.isNaN(south) &&
        !Number.isNaN(east) &&
        !Number.isNaN(north) &&
        Math.abs(west) <= 180 &&
        Math.abs(east) <= 180 &&
        Math.abs(south) <= 90 &&
        Math.abs(north) <= 90
      ) {
        try {
         
          fitMapToBounds(map, bounds, {
            padding: 400,
            duration: 5000,
          })
          initialBoundsAppliedRef.current = true
          return
        } catch (error) {
          console.warn('Failed to fit map to bounds:', error)
        }
      } else {
        console.warn('Invalid bounds calculated, skipping fitBounds:', bounds)
      }
    }

   
    if (taskMarkersData && markersData.markers.length > 0) {
      const primaryTaskMarker = markersData.markers.find((marker) => marker.id === primaryTaskId)

      if (primaryTaskMarker?.location) {
        const location = primaryTaskMarker.location
        if (isValidLocation(location)) {
          mapRef.current.flyTo({
            center: [location.lng, location.lat],
            zoom: 15,
            duration: 1000,
          })
          initialBoundsAppliedRef.current = true
          return
        }
      }
    }

   
    if (task.location) {
      let latitude = 0
      let longitude = 0

      if (typeof task.location === 'string') {
        try {
          const parsed = JSON.parse(task.location) as { lng?: number; lat?: number }
          if (parsed.lng != null && parsed.lat != null) {
            longitude = parsed.lng
            latitude = parsed.lat
          }
        } catch {
          return
        }
      } else if (
        typeof task.location === 'object' &&
        task.location != null &&
        'lng' in task.location &&
        'lat' in task.location
      ) {
        const loc = task.location as { lng: number; lat: number }
        longitude = loc.lng
        latitude = loc.lat
      }

      if (longitude !== 0 || latitude !== 0) {
        mapRef.current.flyTo({
          center: [longitude, latitude],
          zoom: 15,
          duration: 1000,
        })
        initialBoundsAppliedRef.current = true
      }
    }
  }, [
    mapLoaded,
    isLoadingMarkers,
    taskMarkersData,
    markersData.markers,
    primaryTaskId,
    task,
    fullTaskData,
  ])

  const handleMapClick = useCallback(
    async (e: MapMouseEvent) => {
      // Clear spidering when clicking on empty space
      if (!e.features || e.features.length === 0) {
        setSpideredMarkers(new Map())
        setPopupInfo(null)
        return
      }

      const feature = e.features[0]
      if (!feature) {
        setSpideredMarkers(new Map())
        setPopupInfo(null)
        return
      }

      if (!mapRef.current) return

      const map = mapRef.current.getMap()
      if (!map) return

      if (shouldCluster) {
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
          setSpideredMarkers(new Map())
          setPopupInfo(null)
        }
      } else {
        // Check if clicking on a spidered marker
        const isSpideredMarker =
          feature.layer?.id === 'spidered-markers-layer' &&
          feature.properties?.id !== undefined &&
          feature.geometry.type === 'Point'

        if (isSpideredMarker) {
          const taskId = feature.properties.id as number
          const task = markersData.markers.find((m) => m.id === taskId)
          if (task) {
            setPopupInfo({ type: 'single', task })
          }
          return
        }

        // Check if clicking on an overlap marker (rendered as a layer-based feature)
        const isOverlapMarker =
          feature.layer?.id === LAYER_IDS.points &&
          feature.properties?.isOverlapping === true &&
          feature.properties?.overlapId !== undefined

        if (isOverlapMarker) {
          const overlapId = feature.properties.overlapId as string
          const overlapGroup = overlapGroupsMap.get(overlapId)
          if (overlapGroup) {
            const currentZoom = map.getZoom()
            const spiderGroup = createSpiderGroup(overlapGroup.tasks, overlapGroup.center, currentZoom)
            setSpideredMarkers(spiderGroup)
            setPopupInfo(null)
          }
          return
        }

        // Check for visual overlaps at click point (fallback for any remaining overlaps)
        const clickPoint = e.point
        const overlappingMarkers = detectVisualOverlaps(map, clickPoint, LAYER_IDS.points)

        if (overlappingMarkers.length > 1) {
          // Multiple markers overlapping - spider them
          // Use the click point's lng/lat coordinates
          const lngLat = e.lngLat
          const coordinates: [number, number] = [lngLat.lng, lngLat.lat]
          const currentZoom = map.getZoom()
          const spiderGroup = createSpiderGroup(overlappingMarkers, coordinates, currentZoom)
          setSpideredMarkers(spiderGroup)
          // Don't show popup automatically - only when user clicks on a spidered marker
          setPopupInfo(null)
        } else {
          // Single marker or no overlap
          const isUnclusteredPoint =
            feature.layer?.id === LAYER_IDS.points &&
            feature.properties?.id !== undefined &&
            feature.geometry.type === 'Point'

          if (isUnclusteredPoint) {
            const taskId = feature.properties.id as number
            const task = markersData.markers.find((m) => m.id === taskId)
            if (task) {
              setSpideredMarkers(new Map())
              setPopupInfo({ type: 'single', task })
            }
          } else {
            setSpideredMarkers(new Map())
            setPopupInfo(null)
          }
        }
      }
    },
    [shouldCluster, markersData.markers, setPopupInfo, overlapGroupsMap]
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
    setCluster,
    geoJSONData,
    primaryTaskId,
    spideredMarkers,
    setSpideredMarkers,
  }
}
