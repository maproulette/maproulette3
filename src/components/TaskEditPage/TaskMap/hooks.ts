import type maplibregl from 'maplibre-gl'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MapMouseEvent, MapRef } from 'react-map-gl/maplibre'
import Supercluster from 'supercluster'
import { api } from '@/api'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import { createMarkerIcons } from '@/components/shared/TaskMarkers/createMarkerIcons'
import { detectOverlappingTasks } from '@/components/shared/TaskMarkers/overlapUtils'
import type { TaskMarker } from '@/types/Task'
import { getStyleSpecification } from '@/utils/mapStyles'
import { fitMapToBounds } from '@/utils/mapUtils'
import { useTaskContext } from '../contexts/TaskContext'
import { createSpiderGroup, detectVisualOverlaps } from './spiderUtils'
import type { PopupInfo } from './types'
import {
  calculateTaskCount,
  convertTaskMarkersToGeoJSON,
  isValidLocation,
  processMarkersData,
} from './utils'

// Threshold for skipping expensive O(n²) overlap detection
const OVERLAP_DETECTION_THRESHOLD = 5000

// Threshold for enforcing clustering to prevent WebGL vertex buffer overflow
const FORCE_CLUSTER_THRESHOLD = 20000

interface ClusterProperties {
  cluster: true
  cluster_id: number
  point_count: number
  point_count_abbreviated: string
  taskCount?: number
}

interface PointProperties {
  cluster?: false
  id: number
  status: number
  priority: number
  difficulty: number
  isHighlighted?: boolean
  isSelected?: boolean
  isLassoSelected?: boolean
  isOverlapping?: boolean
  overlapId?: string
  overlapTaskCount?: number
}

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
  // Cluster toggle: true = clustered (25px radius), false = unclustered (0px)
  const [isClustered, setIsClustered] = useState<boolean>(true)
  const [spideredMarkers, setSpideredMarkers] = useState<
    Map<number, { original: [number, number]; spidered: [number, number] }>
  >(new Map())
  const initialBoundsAppliedRef = useRef(false)
  const superclusterRef = useRef<Supercluster<PointProperties, ClusterProperties> | null>(null)
  const [mapZoom, setMapZoom] = useState(2)
  const [mapBounds, setMapBounds] = useState<[number, number, number, number]>([-180, -85, 180, 85])
  // Counter to force re-render when icons are loaded - incrementing always triggers new render
  const [iconsVersion, setIconsVersion] = useState(0)
  const primaryTaskId = task.id
  const challengeId = task.parent

  const { data: taskMarkersData, isLoading: isLoadingMarkers } =
    api.challenge.getChallengeTaskMarkers(challengeId)

  const { data: fullTaskData } = api.task.getTask(primaryTaskId)

  const taskCount = useMemo(() => calculateTaskCount(taskMarkersData), [taskMarkersData])

  const markersData = useMemo(() => {
    return processMarkersData(taskMarkersData)
  }, [taskMarkersData])

  const shouldCluster = useMemo(() => {
    return true
  }, [isClustered])

  const bundleTaskIdsSet = useMemo(() => {
    return new Set(activeBundle?.taskIds ?? [])
  }, [])

  const overlapData = useMemo(() => {
    // Skip expensive O(n²) overlap detection for large datasets
    // Visual overlap detection at click time handles this case instead
    if (markersData.markers.length > OVERLAP_DETECTION_THRESHOLD) {
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
  }, [markersData.markers, showBundleOnly, bundleTaskIdsSet, primaryTaskId])

  const overlappingTaskIds = useMemo(() => {
    // Always use overlap markers for tasks at exact same position
    if (overlapData.overlaps.length === 0) {
      return new Set<number>()
    }
    const ids = new Set<number>()
    overlapData.overlaps.forEach((overlap) => {
      overlap.tasks.forEach((task) => {
        ids.add(task.id)
      })
    })
    return ids
  }, [overlapData.overlaps])

  // Create a lookup map from overlapId to overlap data for click handling
  const overlapGroupsMap = useMemo(() => {
    const map = new Map<string, { center: [number, number]; tasks: TaskMarker[] }>()
    overlapData.overlaps.forEach((overlap) => {
      map.set(overlap.id, { center: overlap.center, tasks: overlap.tasks })
    })
    return map
  }, [overlapData.overlaps])

  const geoJSONData = useMemo(() => {
    let markersToUse = markersData.markers

    if (showBundleOnly && bundleTaskIdsSet.size > 0) {
      markersToUse = markersData.markers.filter(
        (marker) => marker.id === primaryTaskId || bundleTaskIdsSet.has(marker.id)
      )
    }

    // Always filter out overlapping tasks (they'll be represented by overlap markers)
    let nonOverlappingMarkers = markersToUse
    if (overlappingTaskIds.size > 0) {
      nonOverlappingMarkers = markersToUse.filter((marker) => !overlappingTaskIds.has(marker.id))
    }

    // Convert non-overlapping markers to GeoJSON
    const baseGeoJSON =
      nonOverlappingMarkers.length > 0
        ? convertTaskMarkersToGeoJSON(nonOverlappingMarkers as TaskMarker[])
        : { type: 'FeatureCollection' as const, features: [] }

    // Always add overlap marker features for tasks at exact same position
    if (overlapData.overlaps.length > 0) {
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
    overlappingTaskIds,
    overlapData.overlaps,
  ])

  // Derive selectedTaskId from popupInfo
  const selectedTaskId = popupInfo?.type === 'single' ? popupInfo.task.id : null

  // Convert geoJSONData to point features for supercluster with styling
  // Note: isLassoSelected is applied in TaskMap.tsx since useLassoSelection depends on this hook
  const pointFeatures = useMemo(() => {
    const bundleTaskIds = new Set(activeBundle?.taskIds ?? [])

    const features = geoJSONData.features
      .filter((f): f is GeoJSON.Feature<GeoJSON.Point> => f.geometry.type === 'Point')
      .map((feature) => {
        const taskId = feature.properties?.id as number | undefined
        const isOverlapping = feature.properties?.isOverlapping === true
        // For overlap features, preserve the isHighlighted value calculated in geoJSONData
        // (which checks if ANY task in the overlap is highlighted)
        const isHighlighted = isOverlapping
          ? ((feature.properties?.isHighlighted as boolean) ?? false)
          : taskId != null && (taskId === primaryTaskId || bundleTaskIds.has(taskId))
        const isSelected = taskId === selectedTaskId

        return {
          type: 'Feature' as const,
          geometry: feature.geometry,
          properties: {
            cluster: false as const,
            id: taskId as number,
            status: feature.properties?.status as number,
            priority: feature.properties?.priority as number,
            difficulty: feature.properties?.difficulty as number,
            isHighlighted,
            isSelected,
            isLassoSelected: false,
            isOverlapping,
            overlapId: feature.properties?.overlapId as string | undefined,
            overlapTaskCount: feature.properties?.overlapTaskCount as number | undefined,
          },
        }
      })

    return features
  }, [geoJSONData, primaryTaskId, activeBundle, selectedTaskId])

  // Track map viewport changes for clustering
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return

    const map = mapRef.current.getMap()
    if (!map) return

    const updateViewport = () => {
      const currentZoom = Math.floor(map.getZoom())
      const bounds = map.getBounds()
      if (bounds) {
        const newBounds: [number, number, number, number] = [
          bounds.getWest(),
          bounds.getSouth(),
          bounds.getEast(),
          bounds.getNorth(),
        ]
        setMapBounds(newBounds)
      }
      setMapZoom(currentZoom)
    }

    // Initial update
    updateViewport()

    // Listen for map changes - use both 'move' and 'moveend' to update during animations
    // 'move' fires continuously during pan/zoom, 'moveend' fires when movement stops
    map.on('move', updateViewport)
    map.on('moveend', updateViewport)

    return () => {
      map.off('move', updateViewport)
      map.off('moveend', updateViewport)
    }
  }, [mapLoaded])

  // Build TWO Supercluster indices - one clustered, one unclustered
  // This allows us to check visible point count before deciding which to use
  const { clusteredIndex, unclusteredIndex } = useMemo(() => {
    if (pointFeatures.length === 0) {
      return { clusteredIndex: null, unclusteredIndex: null }
    }

    const clusterOptions = {
      maxZoom: 16,
      minZoom: 0,
      map: (props: PointProperties) =>
        ({
          taskCount: props.isOverlapping && props.overlapTaskCount ? props.overlapTaskCount : 1,
        }) as unknown as ClusterProperties,
      reduce: (accumulated: ClusterProperties, props: ClusterProperties) => {
        accumulated.taskCount = (accumulated.taskCount || 0) + (props.taskCount || 1)
      },
    }

    // Clustered index (radius=25)
    const clustered = new Supercluster<PointProperties, ClusterProperties>({
      ...clusterOptions,
      radius: 25,
    })
    clustered.load(pointFeatures)

    // Unclustered index (radius=0) - only create if we might need it
    const unclustered = new Supercluster<PointProperties, ClusterProperties>({
      ...clusterOptions,
      radius: 0,
    })
    unclustered.load(pointFeatures)

    return { clusteredIndex: clustered, unclusteredIndex: unclustered }
  }, [pointFeatures])

  // Count visible unclustered points in current viewport
  const visibleUnclusteredCount = useMemo(() => {
    if (!unclusteredIndex) return 0
    const points = unclusteredIndex.getClusters(mapBounds, mapZoom)
    // Count only individual points, not clusters (though with radius=0 there shouldn't be clusters)
    return points.filter((p) => !('cluster_id' in p.properties)).length
  }, [unclusteredIndex, mapBounds, mapZoom])

  // Determine if clustering should be forced based on visible point count
  const isClusteringForced = visibleUnclusteredCount > FORCE_CLUSTER_THRESHOLD

  // Select which index to use based on user preference and force threshold
  const superclusterIndex = useMemo(() => {
    if (isClustered || isClusteringForced) {
      superclusterRef.current = clusteredIndex
      return clusteredIndex
    }
    superclusterRef.current = unclusteredIndex
    return unclusteredIndex
  }, [clusteredIndex, unclusteredIndex, isClustered, isClusteringForced])

  // Get clusters for current viewport - this is cheap (O(k) where k = visible clusters)
  // Runs on every viewport change but doesn't rebuild the index
  const clusteredGeoJSONData = useMemo((): GeoJSON.FeatureCollection => {
    if (!superclusterIndex) {
      return { type: 'FeatureCollection', features: [] }
    }

    // Force higher cluster radius at very low zoom to prevent WebGL vertex buffer overflow
    const effectiveZoom = mapZoom < 2 ? 0 : mapZoom
    const clusters = superclusterIndex.getClusters(mapBounds, effectiveZoom)

    // Filter out spidered markers from the regular layer (they're rendered separately)
    const filteredClusters = clusters.filter((cluster) => {
      // Keep clusters (they don't have an id property in the same way)
      if ('cluster_id' in cluster.properties && 'point_count' in cluster.properties) {
        return true
      }
      // Filter out individual points that are spidered
      const taskId = (cluster.properties as PointProperties).id
      return !spideredMarkers.has(taskId)
    })

    const features = filteredClusters.map((cluster) => {
      // Check if this is a cluster (has cluster_id and point_count from supercluster)
      const isCluster =
        cluster.properties &&
        'cluster_id' in cluster.properties &&
        'point_count' in cluster.properties

      if (isCluster) {
        const props = cluster.properties as ClusterProperties
        // Use taskCount (actual task count including overlap markers) for display
        const actualTaskCount = props.taskCount || props.point_count
        return {
          type: 'Feature' as const,
          geometry: cluster.geometry,
          properties: {
            cluster: true,
            cluster_id: props.cluster_id,
            point_count: actualTaskCount,
            point_count_abbreviated:
              actualTaskCount >= 1000
                ? `${Math.round(actualTaskCount / 1000)}k`
                : String(actualTaskCount),
          },
        }
      }

      // Individual point - ensure cluster properties are NOT present
      // This is critical for the layer filter ['!', ['has', 'point_count']] to work
      const pointProps = cluster.properties as PointProperties
      return {
        type: 'Feature' as const,
        geometry: cluster.geometry,
        properties: {
          id: pointProps.id,
          status: pointProps.status,
          priority: pointProps.priority,
          difficulty: pointProps.difficulty,
          isHighlighted: pointProps.isHighlighted,
          isSelected: pointProps.isSelected,
          isLassoSelected: pointProps.isLassoSelected,
          isOverlapping: pointProps.isOverlapping,
          overlapId: pointProps.overlapId,
          overlapTaskCount: pointProps.overlapTaskCount,
        },
      }
    })

    return {
      type: 'FeatureCollection',
      features,
    }
    // iconsVersion forces re-render when icons are loaded
  }, [superclusterIndex, mapBounds, mapZoom, iconsVersion, spideredMarkers])

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
    // Pass a callback to trigger repaint when icons are ready
    createMarkerIcons({ current: map }, () => {
      // Force MapLibre to re-render now that icons are available
      map.triggerRepaint()
      // Increment version to force React to re-render with new data reference
      setIconsVersion((v) => v + 1)
    })
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

      // Check if clicking on a spidered marker (always handle first)
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

      // Check if clicking on an overlap marker (always handle - overlap markers are always shown)
      const isOverlapMarker =
        feature.layer?.id === LAYER_IDS.points &&
        feature.properties?.isOverlapping === true &&
        feature.properties?.overlapId !== undefined

      if (isOverlapMarker) {
        const overlapId = feature.properties.overlapId as string
        const overlapGroup = overlapGroupsMap.get(overlapId)
        if (overlapGroup) {
          const spiderGroup = createSpiderGroup(overlapGroup.tasks, overlapGroup.center, map)
          setSpideredMarkers(spiderGroup)
          setPopupInfo(null)
        }
        return
      }

      // Check if clicking on a Supercluster cluster
      const isClientSideCluster =
        feature.properties?.cluster_id !== undefined ||
        feature.properties?.point_count !== undefined

      if (isClientSideCluster && feature.geometry.type === 'Point') {
        const coordinates = feature.geometry.coordinates as [number, number]
        const clusterId = feature.properties.cluster_id as number

        if (superclusterRef.current && clusterId !== undefined) {
          try {
            const zoom = superclusterRef.current.getClusterExpansionZoom(clusterId)
            const targetZoom = Math.min(zoom, map.getMaxZoom())
            mapRef.current.easeTo({
              center: coordinates,
              zoom: targetZoom,
              duration: 500,
            })
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
        setSpideredMarkers(new Map())
        return
      }

      // Check if clicking on a regular unclustered point
      const isUnclusteredPoint =
        feature.layer?.id === LAYER_IDS.points &&
        feature.properties?.id !== undefined &&
        feature.geometry.type === 'Point'

      if (isUnclusteredPoint) {
        // Check for visual overlaps at click point (markers that look overlapping on screen)
        // Use 15px tolerance to account for marker icon size (32x44 pixels)
        const clickPoint = e.point
        const visuallyOverlappingMarkers = detectVisualOverlaps(
          map,
          clickPoint,
          LAYER_IDS.points,
          15
        )

        if (visuallyOverlappingMarkers.length > 1) {
          // Multiple markers visually overlapping - spider them
          const lngLat = e.lngLat
          const coordinates: [number, number] = [lngLat.lng, lngLat.lat]
          const spiderGroup = createSpiderGroup(visuallyOverlappingMarkers, coordinates, map)
          setSpideredMarkers(spiderGroup)
          setPopupInfo(null)
          return
        }

        // Single marker - show popup
        const taskId = feature.properties.id as number
        const task = markersData.markers.find((m) => m.id === taskId)
        if (task) {
          setSpideredMarkers(new Map())
          setPopupInfo({ type: 'single', task })
        }
        return
      }

      // Clicked on something else - clear state
      setSpideredMarkers(new Map())
      setPopupInfo(null)
    },
    [markersData.markers, setPopupInfo, overlapGroupsMap]
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
    isClustered,
    setIsClustered,
    geoJSONData,
    clusteredGeoJSONData,
    primaryTaskId,
    spideredMarkers,
    setSpideredMarkers,
    // Clustering is forced when there are too many visible points in viewport
    isClusteringForced,
    // Number of tasks visible in current viewport
    visibleTaskCount: visibleUnclusteredCount,
  }
}
