import type maplibregl from 'maplibre-gl'
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { MapMouseEvent, MapRef } from 'react-map-gl/maplibre'
import Supercluster from 'supercluster'
import { api } from '@/api'
import { getStyleSpecification } from '@/components/Map/mapStyles'
import { fitMapToBounds } from '@/components/Map/mapUtils'
import { LAYER_IDS } from '@/components/Map/TaskMarkers/const'
import { createMarkerIcons } from '@/components/Map/TaskMarkers/createMarkerIcons'
import { createSpiderGroup, detectVisualOverlaps } from '@/components/Map/TaskMarkers/spiderUtils'
import {
  calculateTaskCount,
  convertTaskMarkersToGeoJSON,
  isTaskEligibleForBundle,
  isValidLocation,
  processMarkersData,
} from '@/components/Map/TaskMarkers/utils'
import { useTaskBundleContext } from '@/components/Pages/TaskEditPage/contexts/TaskBundleContext'
import { useTaskContext } from '@/components/Pages/TaskEditPage/contexts/TaskContext'
import { useTaskMapContext } from '@/components/Pages/TaskEditPage/contexts/TaskMapContext'
import { useAuthContext } from '@/contexts/AuthContext'
import { logger } from '@/lib/logger'
import type { TaskMarker } from '@/types/Task'
import { calculateBoundingBox } from './calculateBoundingBox'
import { extractGeometries } from './extractGeometries'

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
  bundleId?: number | null
  lockedBy?: number | null
  isHighlighted?: boolean
  isPrimary?: boolean
  isSelected?: boolean
  isLassoSelected?: boolean
  isOverlapping?: boolean
  isEligibleForBundle?: boolean
  distanceToPrimary?: number
  overlapId?: string
  overlapTaskCount?: number
}

interface TaskEditMapContextType {
  mapRef: React.RefObject<MapRef | null>
  mapLoaded: boolean
  setMapLoaded: (loaded: boolean) => void
  isStylePanelOpen: boolean
  setIsStylePanelOpen: (open: boolean) => void
  defaultStyle: string | maplibregl.StyleSpecification
  taskCount: number
  shouldCluster: boolean
  markersData: {
    markers: TaskMarker[]
    overlapMarkers: Array<{
      location: { lng: number; lat: number }
      tasks: TaskMarker[]
    }>
  }
  overlapData: {
    overlaps: Array<{
      id: string
      center: [number, number]
      tasks: TaskMarker[]
      radius: number
    }>
    nonOverlapping: never[]
  }
  isLoadingMarkers: boolean
  onMapClick: (e: MapMouseEvent) => void
  onMouseMove: (e: MapMouseEvent) => void
  isClustered: boolean
  setIsClustered: (clustered: boolean) => void
  geoJSONData: GeoJSON.FeatureCollection
  clusteredGeoJSONData: GeoJSON.FeatureCollection
  primaryTaskId: number
  spideredMarkers: Map<number, { original: [number, number]; spidered: [number, number] }>
  setSpideredMarkers: React.Dispatch<
    React.SetStateAction<Map<number, { original: [number, number]; spidered: [number, number] }>>
  >
  isClusteringForced: boolean
  initialBoundsApplied: boolean
  showExploreLayer: boolean
  setShowExploreLayer: (show: boolean) => void
}

const TaskEditMapContext = createContext<TaskEditMapContextType | null>(null)

export const TaskEditMapProvider = ({ children }: { children: ReactNode }) => {
  const { showBundleOnly, activeBundle } = useTaskBundleContext()
  const { task } = useTaskContext()
  const { user } = useAuthContext()
  const {
    selectedMarker,
    setSelectedMarker,
    map: mapRef,
    triggerEmptyClick,
    drawingMode,
  } = useTaskMapContext()
  const [mapLoaded, setMapLoaded] = useState(false)
  const [isStylePanelOpen, setIsStylePanelOpen] = useState(false)

  const [isClustered, setIsClustered] = useState<boolean>(true)
  const [showExploreLayer, setShowExploreLayer] = useState<boolean>(false)
  const [spideredMarkers, setSpideredMarkers] = useState<
    Map<number, { original: [number, number]; spidered: [number, number] }>
  >(new Map())
  const initialBoundsAppliedRef = useRef(false)
  const [initialBoundsApplied, setInitialBoundsApplied] = useState(false)
  const superclusterRef = useRef<Supercluster<PointProperties, ClusterProperties> | null>(null)
  const [mapZoom, setMapZoom] = useState(2)
  const [mapBounds, setMapBounds] = useState<[number, number, number, number]>([-180, -85, 180, 85])

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

  const shouldCluster = true

  const bundleTaskIdsSet = useMemo(() => {
    return new Set(activeBundle?.taskIds ?? [])
  }, [activeBundle?.taskIds])

  const overlapData = useMemo(() => {
    let overlapMarkersToUse = markersData.overlapMarkers

    if (showBundleOnly) {
      overlapMarkersToUse = markersData.overlapMarkers.filter((overlap) => {
        return overlap.tasks.some(
          (task) => task.id === primaryTaskId || bundleTaskIdsSet.has(task.id)
        )
      })
    }

    const overlaps = overlapMarkersToUse.map((overlap) => {
      const center: [number, number] = [overlap.location.lng, overlap.location.lat]
      const taskIds = overlap.tasks.map((t) => t.id).join('-')
      const overlapId = `overlap-${taskIds}`

      return {
        id: overlapId,
        center,
        tasks: overlap.tasks,
        radius: 8,
      }
    })

    return { overlaps, nonOverlapping: [] }
  }, [markersData.overlapMarkers, showBundleOnly, bundleTaskIdsSet, primaryTaskId])

  const overlappingTaskIds = useMemo(() => {
    const ids = new Set<number>()
    markersData.overlapMarkers.forEach((overlap) => {
      overlap.tasks.forEach((task) => {
        ids.add(task.id)
      })
    })
    return ids
  }, [markersData.overlapMarkers])

  const overlapGroupsMap = useMemo(() => {
    const map = new Map<string, { center: [number, number]; tasks: TaskMarker[] }>()
    overlapData.overlaps.forEach((overlap) => {
      map.set(overlap.id, { center: overlap.center, tasks: overlap.tasks })
    })
    return map
  }, [overlapData.overlaps])

  const geoJSONData = useMemo(() => {
    let markersToUse = markersData.markers

    if (showBundleOnly) {
      markersToUse = markersData.markers.filter(
        (marker) => marker.id === primaryTaskId || bundleTaskIdsSet.has(marker.id)
      )
    }

    let nonOverlappingMarkers = markersToUse
    if (overlappingTaskIds.size > 0) {
      nonOverlappingMarkers = markersToUse.filter((marker) => !overlappingTaskIds.has(marker.id))
    }

    const baseGeoJSON =
      nonOverlappingMarkers.length > 0
        ? convertTaskMarkersToGeoJSON(nonOverlappingMarkers as TaskMarker[])
        : { type: 'FeatureCollection' as const, features: [] }

    if (overlapData.overlaps.length > 0) {
      const overlapFeatures = overlapData.overlaps.map((overlap) => {
        const hasPrimary = overlap.tasks.some((t) => t.id === primaryTaskId)
        const hasBundled = overlap.tasks.some((t) => bundleTaskIdsSet.has(t.id))
        const isHighlighted = hasPrimary || hasBundled

        return {
          type: 'Feature' as const,
          properties: {
            id: overlap.tasks[0].id,
            overlapId: overlap.id,
            isOverlapping: true,
            overlapTaskCount: overlap.tasks.length,
            isHighlighted,
            isPrimary: hasPrimary,
            isSelected: false,
            isLassoSelected: false,
            isHovered: false,
            status: 0,
            priority: 0,
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

  const selectedTaskId = selectedMarker?.id ?? null

  const pointFeatures = useMemo(() => {
    const bundleTaskIds = new Set(activeBundle?.taskIds ?? [])

    const primaryTaskBundleId = task.bundleId ?? null
    const currentUserId = user?.id ?? null

    const primaryFeature = geoJSONData.features.find(
      (f) => f.geometry.type === 'Point' && f.properties?.id === primaryTaskId
    ) as GeoJSON.Feature<GeoJSON.Point> | undefined
    const primaryCoords = primaryFeature?.geometry.coordinates as [number, number] | undefined

    const features = geoJSONData.features
      .filter((f): f is GeoJSON.Feature<GeoJSON.Point> => f.geometry.type === 'Point')
      .map((feature) => {
        const taskId = feature.properties?.id as number | undefined
        const isOverlapping = feature.properties?.isOverlapping === true

        const isHighlighted = isOverlapping
          ? ((feature.properties?.isHighlighted as boolean) ?? false)
          : taskId != null && (taskId === primaryTaskId || bundleTaskIds.has(taskId))
        const isSelected = taskId === selectedTaskId

        const isPrimary = taskId === primaryTaskId

        const markerBundleId = (feature.properties?.bundleId as number | null) ?? null
        const markerLockedBy = (feature.properties?.lockedBy as number | null) ?? null
        const markerStatus = feature.properties?.status as number

        const isEligibleForBundle =
          isPrimary ||
          isTaskEligibleForBundle(
            { status: markerStatus, bundleId: markerBundleId, lockedBy: markerLockedBy },
            primaryTaskBundleId,
            currentUserId
          )

        let distanceToPrimary = 0
        if (primaryCoords && !isPrimary) {
          const [lng, lat] = feature.geometry.coordinates
          const dLng = lng - primaryCoords[0]
          const dLat = lat - primaryCoords[1]
          distanceToPrimary = Math.sqrt(dLng * dLng + dLat * dLat)
        }

        return {
          type: 'Feature' as const,
          geometry: feature.geometry,
          properties: {
            cluster: false as const,
            id: taskId as number,
            status: markerStatus,
            priority: feature.properties?.priority as number,
            bundleId: markerBundleId,
            lockedBy: markerLockedBy,
            isHighlighted,
            isPrimary,
            isSelected,
            isLassoSelected: false,
            isOverlapping,
            isEligibleForBundle,
            distanceToPrimary,
            overlapId: feature.properties?.overlapId as string | undefined,
            overlapTaskCount: feature.properties?.overlapTaskCount as number | undefined,
          },
        }
      })

    return features
  }, [geoJSONData, primaryTaskId, activeBundle, selectedTaskId, task.bundleId, user?.id])

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

    updateViewport()

    map.on('move', updateViewport)
    map.on('moveend', updateViewport)

    return () => {
      map.off('move', updateViewport)
      map.off('moveend', updateViewport)
    }
  }, [mapLoaded])

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

    const clustered = new Supercluster<PointProperties, ClusterProperties>({
      ...clusterOptions,
      radius: 25,
    })
    clustered.load(pointFeatures)

    const unclustered = new Supercluster<PointProperties, ClusterProperties>({
      ...clusterOptions,
      radius: 0,
    })
    unclustered.load(pointFeatures)

    return { clusteredIndex: clustered, unclusteredIndex: unclustered }
  }, [pointFeatures])

  const isClusteringForced = mapZoom < 2

  const superclusterIndex = useMemo(() => {
    if (isClustered || isClusteringForced) {
      superclusterRef.current = clusteredIndex
      return clusteredIndex
    }
    superclusterRef.current = unclusteredIndex
    return unclusteredIndex
  }, [clusteredIndex, unclusteredIndex, isClustered, isClusteringForced])

  const clusteredGeoJSONData = useMemo((): GeoJSON.FeatureCollection => {
    if (!superclusterIndex) {
      return { type: 'FeatureCollection', features: [] }
    }

    const effectiveZoom = mapZoom < 2 ? 0 : mapZoom
    const clusters = superclusterIndex.getClusters(mapBounds, effectiveZoom)

    const filteredClusters = clusters.filter((cluster) => {
      if ('cluster_id' in cluster.properties && 'point_count' in cluster.properties) {
        return true
      }

      const taskId = (cluster.properties as PointProperties).id
      return !spideredMarkers.has(taskId)
    })

    const features = filteredClusters.map((cluster) => {
      const isCluster =
        cluster.properties &&
        'cluster_id' in cluster.properties &&
        'point_count' in cluster.properties

      if (isCluster) {
        const props = cluster.properties as ClusterProperties

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

      const pointProps = cluster.properties as PointProperties
      return {
        type: 'Feature' as const,
        geometry: cluster.geometry,
        properties: {
          id: pointProps.id,
          status: pointProps.status,
          priority: pointProps.priority,
          bundleId: pointProps.bundleId,
          lockedBy: pointProps.lockedBy,
          isHighlighted: pointProps.isHighlighted,
          isPrimary: pointProps.isPrimary,
          isSelected: pointProps.isSelected,
          isLassoSelected: pointProps.isLassoSelected,
          isOverlapping: pointProps.isOverlapping,
          isEligibleForBundle: pointProps.isEligibleForBundle,
          distanceToPrimary: pointProps.distanceToPrimary,
          overlapId: pointProps.overlapId,
          overlapTaskCount: pointProps.overlapTaskCount,
        },
      }
    })

    return {
      type: 'FeatureCollection',
      features,
    }
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

    createMarkerIcons({ current: map }, () => {
      map.triggerRepaint()

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
          setInitialBoundsApplied(true)
          return
        } catch (error) {
          logger.warn('Failed to fit map to bounds', { error: String(error) })
        }
      } else {
        logger.warn('Invalid bounds calculated, skipping fitBounds', { bounds: String(bounds) })
      }
    }

    if (taskMarkersData && markersData.markers.length > 0) {
      const primaryTaskMarker = markersData.markers.find((marker) => marker.id === primaryTaskId)

      if (primaryTaskMarker?.location) {
        const location = primaryTaskMarker.location
        if (isValidLocation(location)) {
          mapRef.current.jumpTo({
            center: [location.lng, location.lat],
            zoom: 15,
          })
          initialBoundsAppliedRef.current = true
          setInitialBoundsApplied(true)
          return
        }
      }
    }

    if (task.location) {
      // Task.location is a GeoJSON Point: { type: 'Point', coordinates: [lng, lat] }
      const coords = (task.location as { coordinates?: [number, number] }).coordinates
      let longitude = 0
      let latitude = 0
      if (Array.isArray(coords) && coords.length >= 2) {
        longitude = coords[0]
        latitude = coords[1]
      }

      if (longitude !== 0 || latitude !== 0) {
        mapRef.current.jumpTo({
          center: [longitude, latitude],
          zoom: 15,
        })
        initialBoundsAppliedRef.current = true
        setInitialBoundsApplied(true)
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
      if (!e.features || e.features.length === 0) {
        setSpideredMarkers(new Map())
        setSelectedMarker(null)
        triggerEmptyClick()
        return
      }

      const feature = e.features[0]
      if (!feature) {
        setSpideredMarkers(new Map())
        setSelectedMarker(null)
        triggerEmptyClick()
        return
      }

      if (!mapRef.current) return

      const map = mapRef.current.getMap()
      if (!map) return

      const isSpideredMarker =
        feature.layer?.id === 'spidered-markers-layer' &&
        feature.properties?.id !== undefined &&
        feature.geometry.type === 'Point'

      if (isSpideredMarker) {
        const taskId = feature.properties.id as number

        let task = markersData.markers.find((m) => m.id === taskId)
        if (!task) {
          for (const overlapGroup of overlapGroupsMap.values()) {
            const overlapTask = overlapGroup.tasks.find((t) => t.id === taskId)
            if (overlapTask) {
              task = overlapTask
              break
            }
          }
        }
        if (task && task.id !== primaryTaskId) {
          setSelectedMarker(task)
        } else {
          setSelectedMarker(null)
        }
        return
      }

      const isOverlapMarker =
        LAYER_IDS.allPoints.includes(feature.layer?.id ?? '') &&
        feature.properties?.isOverlapping === true &&
        feature.properties?.overlapId !== undefined

      if (isOverlapMarker) {
        const overlapId = feature.properties.overlapId as string
        const overlapGroup = overlapGroupsMap.get(overlapId)
        if (overlapGroup) {
          const spiderGroup = createSpiderGroup(overlapGroup.tasks, overlapGroup.center, map)
          setSpideredMarkers(spiderGroup)
          setSelectedMarker(null)
        } else {
          const clickPoint = e.point
          const visuallyOverlappingMarkers = detectVisualOverlaps(
            map,
            clickPoint,
            LAYER_IDS.allPoints,
            15
          )
          if (visuallyOverlappingMarkers.length > 0) {
            const lngLat = e.lngLat
            const coordinates: [number, number] = [lngLat.lng, lngLat.lat]
            const spiderGroup = createSpiderGroup(visuallyOverlappingMarkers, coordinates, map)
            setSpideredMarkers(spiderGroup)
            setSelectedMarker(null)
          }
        }
        return
      }

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
            mapRef.current.jumpTo({
              center: coordinates,
              zoom: targetZoom,
            })
          } catch (error) {
            logger.warn('Failed to expand cluster', { error: String(error) })
            const currentZoom = map.getZoom()
            mapRef.current.jumpTo({
              center: coordinates,
              zoom: Math.min(currentZoom + 2, map.getMaxZoom()),
            })
          }
        }
        setSpideredMarkers(new Map())
        return
      }

      const isUnclusteredPoint =
        LAYER_IDS.allPoints.includes(feature.layer?.id ?? '') &&
        feature.properties?.id !== undefined &&
        feature.geometry.type === 'Point'

      if (isUnclusteredPoint) {
        const clickPoint = e.point
        const visuallyOverlappingMarkers = detectVisualOverlaps(
          map,
          clickPoint,
          LAYER_IDS.allPoints,
          15
        )

        if (visuallyOverlappingMarkers.length > 1) {
          const lngLat = e.lngLat
          const coordinates: [number, number] = [lngLat.lng, lngLat.lat]
          const spiderGroup = createSpiderGroup(visuallyOverlappingMarkers, coordinates, map)
          setSpideredMarkers(spiderGroup)
          setSelectedMarker(null)
          return
        }

        const taskId = feature.properties.id as number
        if (taskId === primaryTaskId) {
          setSpideredMarkers(new Map())
          setSelectedMarker(null)
          return
        }
        const task = markersData.markers.find((m) => m.id === taskId)
        if (task) {
          setSpideredMarkers(new Map())
          setSelectedMarker(task)
        }
        return
      }

      setSpideredMarkers(new Map())
      setSelectedMarker(null)
    },
    [markersData.markers, setSelectedMarker, overlapGroupsMap, primaryTaskId]
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
        for (const id of LAYER_IDS.allPoints) {
          if (map.getLayer(id)) layersToQuery.push(id)
        }
      } else {
        for (const id of LAYER_IDS.allPoints) {
          if (map.getLayer(id)) layersToQuery.push(id)
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
          LAYER_IDS.allPoints.includes(feature.layer?.id ?? '') ||
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

  const onMapClick = useCallback(
    (e: MapMouseEvent) => {
      if (!drawingMode) {
        handleMapClick(e)
      }
    },
    [drawingMode, handleMapClick]
  )

  const onMouseMove = useCallback(
    (e: MapMouseEvent) => {
      if (!drawingMode) {
        handleMapMouseMove(e)
      }
    },
    [drawingMode, handleMapMouseMove]
  )

  const value = useMemo(
    () => ({
      mapRef,
      mapLoaded,
      setMapLoaded,
      isStylePanelOpen,
      setIsStylePanelOpen,
      defaultStyle,
      taskCount,
      shouldCluster,
      markersData,
      overlapData,
      isLoadingMarkers,
      onMapClick,
      onMouseMove,
      isClustered,
      setIsClustered,
      geoJSONData,
      clusteredGeoJSONData,
      primaryTaskId,
      spideredMarkers,
      setSpideredMarkers,
      isClusteringForced,
      initialBoundsApplied,
      showExploreLayer,
      setShowExploreLayer,
    }),
    [
      mapRef,
      mapLoaded,
      isStylePanelOpen,
      defaultStyle,
      taskCount,
      shouldCluster,
      markersData,
      overlapData,
      isLoadingMarkers,
      onMapClick,
      onMouseMove,
      isClustered,
      geoJSONData,
      clusteredGeoJSONData,
      primaryTaskId,
      spideredMarkers,
      isClusteringForced,
      initialBoundsApplied,
      showExploreLayer,
    ]
  )

  return <TaskEditMapContext.Provider value={value}>{children}</TaskEditMapContext.Provider>
}

export const useTaskEditMapContext = () => {
  const context = useContext(TaskEditMapContext)
  if (!context) {
    throw new Error('useTaskEditMapContext must be used within a TaskEditMapProvider')
  }
  return context
}
