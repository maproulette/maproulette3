import { useQuery } from '@tanstack/react-query'
import type maplibregl from 'maplibre-gl'
import Supercluster from 'supercluster'
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

interface ClusterProperties {
  cluster: true
  cluster_id: number
  point_count: number
  point_count_abbreviated: string
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
  // Cluster radius: 0 = unclustered, higher values = more clustering (max 200)
  const [clusterRadius, setClusterRadius] = useState<number>(50)
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

  const { data: taskMarkersData, isLoading: isLoadingMarkers } = useQuery(
    api.challenge.getChallengeTaskMarkers(challengeId)
  )

  console.log('[TaskMarkersData] API data:', {
    challengeId,
    isLoadingMarkers,
    taskMarkersData,
    taskMarkersDataType: typeof taskMarkersData,
  })


  const { data: fullTaskData } = useQuery(api.task.getTask(primaryTaskId))

  const taskCount = useMemo(() => calculateTaskCount(taskMarkersData), [taskMarkersData])

  const markersData = useMemo(() => {
    const result = processMarkersData(taskMarkersData)
    console.log('[MarkersData] Processed:', {
      inputData: taskMarkersData,
      outputMarkers: result.markers.length,
      sampleMarker: result.markers[0],
    })
    return result
  }, [taskMarkersData])

  const shouldCluster = useMemo(() => {
    return clusterRadius > -1
  }, [clusterRadius])

 
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
    console.log('[GeoJSONData] Computing:', {
      markersCount: markersData.markers.length,
      showBundleOnly,
      bundleTaskIdsSetSize: bundleTaskIdsSet.size,
      shouldCluster,
      overlappingTaskIdsSize: overlappingTaskIds.size,
    })

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

    console.log('[GeoJSONData] After filtering:', {
      markersToUse: markersToUse.length,
      nonOverlappingMarkers: nonOverlappingMarkers.length,
    })

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
        const isHighlighted = taskId != null && (taskId === primaryTaskId || bundleTaskIds.has(taskId))
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
            isOverlapping: feature.properties?.isOverlapping as boolean | undefined,
            overlapId: feature.properties?.overlapId as string | undefined,
            overlapTaskCount: feature.properties?.overlapTaskCount as number | undefined,
          },
        }
      })

    console.log('[PointFeatures] Generated:', {
      geoJSONFeaturesCount: geoJSONData.features.length,
      pointFeaturesCount: features.length,
      sampleFeature: features[0],
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
        console.log('[Viewport] Updating:', {
          rawZoom: map.getZoom(),
          flooredZoom: currentZoom,
          bounds: newBounds,
        })
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

  // Generate clustered GeoJSON data using supercluster
  // Create supercluster inside useMemo to ensure it's available on first render
  const clusteredGeoJSONData = useMemo((): GeoJSON.FeatureCollection => {
    console.log('[Supercluster] Computing clustered data:', {
      pointFeaturesCount: pointFeatures.length,
      clusterRadius,
      mapZoom,
      mapBounds,
    })

    if (pointFeatures.length === 0) {
      console.log('[Supercluster] No point features, returning empty')
      return { type: 'FeatureCollection', features: [] }
    }


    const index = new Supercluster<PointProperties, ClusterProperties>({
      radius: clusterRadius,
      maxZoom: 16,
      minZoom: 0,
    })
    index.load(pointFeatures)
    superclusterRef.current = index

    const clusters = index.getClusters(mapBounds, mapZoom)

    console.log('[Supercluster] getClusters result:', {
      inputCount: pointFeatures.length,
      outputCount: clusters.length,
      clusters: clusters.map(c => ({
        isCluster: 'cluster_id' in (c.properties || {}),
        properties: c.properties,
        geometry: c.geometry,
      })),
    })

    const features = clusters.map((cluster) => {
      // Check if this is a cluster (has cluster_id and point_count from supercluster)
      const isCluster = cluster.properties &&
        'cluster_id' in cluster.properties &&
        'point_count' in cluster.properties

      if (isCluster) {
        const props = cluster.properties as ClusterProperties
        return {
          type: 'Feature' as const,
          geometry: cluster.geometry,
          properties: {
            cluster: true,
            cluster_id: props.cluster_id,
            point_count: props.point_count,
            point_count_abbreviated:
              props.point_count >= 1000
                ? `${Math.round(props.point_count / 1000)}k`
                : String(props.point_count),
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

    // Log the expected icon names for individual points
    const individualPoints = features.filter(f => !f.properties.cluster && f.properties.id)
    const iconNames = individualPoints.slice(0, 5).map(f => {
      const status = f.properties.status
      const difficulty = f.properties.difficulty ?? 1
      return `marker-pin-${status}-${difficulty}`
    })

    console.log('[Supercluster] Final features:', {
      totalFeatures: features.length,
      clusterCount: features.filter(f => f.properties.cluster).length,
      pointCount: individualPoints.length,
      sampleIconNames: iconNames,
      samplePointProperties: individualPoints.slice(0, 3).map(f => f.properties),
    })

    return {
      type: 'FeatureCollection',
      features,
    }
  // Include iconsVersion in deps to force re-render when icons are loaded
  // This ensures the Source component gets a new data reference, triggering MapLibre to re-evaluate symbols
  }, [pointFeatures, clusterRadius, mapBounds, mapZoom, iconsVersion])

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

    console.log('[Icons Effect] Creating marker icons...')

    // Create/recreate marker icons - also re-run when clustering state changes
    // to ensure icons are available for the new source
    // Pass a callback to trigger repaint when icons are ready
    createMarkerIcons({ current: map }, () => {
      console.log('[Icons Effect] Icons loaded, triggering repaint and state update...')
      // Force MapLibre to re-render now that icons are available
      map.triggerRepaint()
      // Increment version to force React to re-render with new data reference
      setIconsVersion((v) => v + 1)
    })

    // Also check after a delay if icons exist
    const checkIconsTimeout = setTimeout(() => {
      const testIconNames = ['marker-pin-0-1', 'marker-pin-1-1', 'marker-pin-0-0']
      testIconNames.forEach((iconName) => {
        const hasIcon = map.hasImage(iconName)
        console.log(`[Icons Effect] After 500ms - hasImage('${iconName}'): ${hasIcon}`)
      })
    }, 500)

    return () => {
      clearTimeout(checkIconsTimeout)
    }
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

        console.log('[MapClick] Cluster mode click:', {
          isClientSideCluster,
          isUnclusteredPoint,
          featureProperties: feature.properties,
          featureGeometry: feature.geometry,
        })

        if (isClientSideCluster && feature.geometry.type === 'Point') {
          const coordinates = feature.geometry.coordinates as [number, number]
          const clusterId = feature.properties.cluster_id as number

          console.log('[MapClick] Expanding cluster:', {
            clusterId,
            coordinates,
            hasSupercluster: !!superclusterRef.current,
          })

          if (superclusterRef.current && clusterId !== undefined) {
            try {
              const zoom = superclusterRef.current.getClusterExpansionZoom(clusterId)
              const targetZoom = Math.min(zoom, map.getMaxZoom())
              console.log('[MapClick] Cluster expansion:', {
                expansionZoom: zoom,
                mapMaxZoom: map.getMaxZoom(),
                targetZoom,
              })
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
    clusterRadius,
    setClusterRadius,
    geoJSONData,
    clusteredGeoJSONData,
    primaryTaskId,
    spideredMarkers,
    setSpideredMarkers,
  }
}
