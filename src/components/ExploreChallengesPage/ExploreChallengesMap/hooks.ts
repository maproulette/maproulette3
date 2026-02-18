import type maplibregl from 'maplibre-gl'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MapMouseEvent, MapRef } from 'react-map-gl/maplibre'
import Supercluster from 'supercluster'
import { api } from '@/api'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import { createMarkerIcons } from '@/components/shared/TaskMarkers/createMarkerIcons'
import {
  createSpiderGroup,
  detectVisualOverlaps,
} from '@/components/shared/TaskMarkers/spiderUtils'
import { convertTaskMarkersToGeoJSON } from '@/components/shared/TaskMarkers/utils'
import type { TaskCluster, TaskMarker } from '@/types/Task'
import { getStyleSpecification } from '@/utils/mapStyles'
import {
  boundsAreEqual,
  fitMapToBounds,
  getMapBoundsString,
  isWorldBounds,
  parseBoundsString,
} from '@/utils/mapUtils'
import { useExploreChallengesSearchContext } from '../ExploreChallengesSearchContext'

export { clusterLayer } from '@/components/shared/TaskMarkers/clusterLayers'

// At this zoom level and above, per-tile fetching + client-side Supercluster is used
const SUPERCLUSTER_ZOOM = 14

interface PointProperties {
  cluster?: false
  id: number
  status: number
  priority: number
  difficulty: number
  isSelected?: boolean
  isOverlapping?: boolean
  overlapId?: string
  overlapTaskCount?: number
}

interface ClusterProperties {
  cluster: true
  cluster_id: number
  point_count: number
  point_count_abbreviated: string
}

export const useExploreChallengesMap = () => {
  const {
    cluster,
    setCluster,
    locationGeojson,
    taskTilesParams,
    setBounds,
    bounds,
    zoom,
    setZoom,
  } = useExploreChallengesSearchContext()
  const mapRef = useRef<MapRef | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [isStylePanelOpen, setIsStylePanelOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<TaskMarker | null>(null)
  const [spideredMarkers, setSpideredMarkers] = useState<
    Map<number, { original: [number, number]; spidered: [number, number] }>
  >(new Map())
  const boundsUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const initialBoundsAppliedRef = useRef(false)
  const lastAppliedBoundsRef = useRef<string | null>(null)

  // Supercluster state
  const superclusterRef = useRef<Supercluster<PointProperties, ClusterProperties> | null>(null)
  const [mapZoom, setMapZoom] = useState(2)
  const [mapBounds, setMapBounds] = useState<[number, number, number, number]>([-180, -85, 180, 85])

  const useSupercluster = zoom >= SUPERCLUSTER_ZOOM

  // Fetch data - zoom level determines clustering granularity
  const { data: taskTilesData, isLoading: isLoadingMarkers } =
    api.task.getTaskTiles(taskTilesParams)

  const taskCount = useMemo(() => taskTilesData?.totalCount ?? 0, [taskTilesData])

  const markersData = useMemo(
    () => ({
      markers: taskTilesData?.tasks ?? [],
      clusters: taskTilesData?.clusters ?? [],
      overlapGroups: taskTilesData?.overlappingTasks ?? [],
    }),
    [taskTilesData]
  )

  // Process overlap groups into overlap features and lookup maps
  const { overlapFeatures, overlapGroupsMap, overlappingTaskIds } = useMemo(() => {
    const groups = markersData.overlapGroups
    if (groups.length === 0) {
      return {
        overlapFeatures: [] as Array<{
          id: string
          center: [number, number]
          tasks: TaskMarker[]
        }>,
        overlapGroupsMap: new Map<string, { center: [number, number]; tasks: TaskMarker[] }>(),
        overlappingTaskIds: new Set<number>(),
      }
    }

    const features: Array<{ id: string; center: [number, number]; tasks: TaskMarker[] }> = []
    const groupsMap = new Map<string, { center: [number, number]; tasks: TaskMarker[] }>()
    const taskIds = new Set<number>()

    groups.forEach((group) => {
      const center: [number, number] = [group.location.lng, group.location.lat]
      const overlapId = `overlap-${group.tasks.map((t) => t.id).join('-')}`
      features.push({ id: overlapId, center, tasks: group.tasks })
      groupsMap.set(overlapId, { center, tasks: group.tasks })
      for (const t of group.tasks) {
        taskIds.add(t.id)
      }
    })

    return { overlapFeatures: features, overlapGroupsMap: groupsMap, overlappingTaskIds: taskIds }
  }, [markersData.overlapGroups])

  // Combined lookup for all markers (regular + overlap tasks) for spider lookups
  const allMarkersMap = useMemo(() => {
    const map = new Map<number, TaskMarker>()
    for (const m of markersData.markers) {
      map.set(m.id, m)
    }
    for (const group of overlapGroupsMap.values()) {
      for (const task of group.tasks) {
        if (!map.has(task.id)) {
          map.set(task.id, task)
        }
      }
    }
    return map
  }, [markersData.markers, overlapGroupsMap])

  // Clustering is always enforced at zoom 0-13 (backend path)
  // At zoom 14+ Supercluster handles clustering client-side, so the toggle is free to use
  const isClusteringForced = useMemo(() => !useSupercluster, [useSupercluster])

  // Effective clustering state - true if user enabled OR backend forces it
  const effectiveClustering = useMemo(
    () => cluster || isClusteringForced,
    [cluster, isClusteringForced]
  )

  // Track map viewport for Supercluster
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return
    const map = mapRef.current.getMap()
    if (!map) return

    const updateViewport = () => {
      const currentZoom = Math.floor(map.getZoom())
      const b = map.getBounds()
      if (b) {
        setMapBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()])
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

  // Convert task markers to Supercluster point features (zoom >= 14 only)
  // Selected task is excluded so it always renders as an individual marker
  // Overlapping tasks are represented as single overlap features (not flattened)
  const { pointFeatures, selectedPointFeature } = useMemo(() => {
    if (!useSupercluster) {
      return { pointFeatures: [], selectedPointFeature: null }
    }

    type PointFeature = {
      type: 'Feature'
      geometry: { type: 'Point'; coordinates: [number, number] }
      properties: PointProperties
    }

    let selected: PointFeature | null = null

    // Regular markers (excluding ones that belong to overlap groups)
    const regularFeatures: PointFeature[] = markersData.markers
      .filter((m) => m.location && !overlappingTaskIds.has(m.id))
      .map((marker) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [marker.location.lng, marker.location.lat] as [number, number],
        },
        properties: {
          cluster: false as const,
          id: marker.id,
          status: marker.status,
          priority: marker.priority,
          difficulty: 1,
          isSelected: marker.id === selectedTask?.id,
        },
      }))

    // Overlap features — one per overlap group
    const overlapPointFeatures: PointFeature[] = overlapFeatures.map((overlap) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: overlap.center,
      },
      properties: {
        cluster: false as const,
        id: overlap.tasks[0].id,
        status: 0,
        priority: 0,
        difficulty: 1,
        isOverlapping: true,
        overlapId: overlap.id,
        overlapTaskCount: overlap.tasks.length,
      },
    }))

    const features = [...regularFeatures, ...overlapPointFeatures]

    const clusterableFeatures = features.filter((f) => {
      if (!f.properties.isOverlapping && f.properties.id === selectedTask?.id) {
        selected = f
        return false
      }
      return true
    })

    // If the selected task wasn't found in the API response (e.g. zoomed past its tile),
    // create a standalone feature from the stored selectedTask state
    if (!selected && selectedTask?.location) {
      selected = {
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [selectedTask.location.lng, selectedTask.location.lat] as [number, number],
        },
        properties: {
          cluster: false as const,
          id: selectedTask.id,
          status: selectedTask.status,
          priority: selectedTask.priority,
          difficulty: 1,
          isSelected: true,
        },
      }
    }

    return {
      pointFeatures: clusterableFeatures,
      selectedPointFeature: selected as PointFeature | null,
    }
  }, [useSupercluster, markersData.markers, selectedTask?.id, overlappingTaskIds, overlapFeatures])

  // Build Supercluster indices
  const { clusteredIndex, unclusteredIndex } = useMemo(() => {
    if (pointFeatures.length === 0) {
      return { clusteredIndex: null, unclusteredIndex: null }
    }

    const clusterOptions = {
      maxZoom: 22,
      minZoom: 0,
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

  // Select which Supercluster index to use
  const superclusterIndex = useMemo(() => {
    const index = cluster || isClusteringForced ? clusteredIndex : unclusteredIndex
    superclusterRef.current = index
    return index
  }, [clusteredIndex, unclusteredIndex, cluster, isClusteringForced])

  // Zoom < 14: backend-clustered GeoJSON (existing logic)
  const backendGeoJSONData = useMemo((): GeoJSON.FeatureCollection => {
    if (useSupercluster) return { type: 'FeatureCollection', features: [] }

    // Filter out markers that belong to overlap groups
    const nonOverlappingMarkers = markersData.markers.filter((m) => !overlappingTaskIds.has(m.id))

    const itemsToShow = effectiveClustering
      ? [...nonOverlappingMarkers, ...markersData.clusters]
      : nonOverlappingMarkers

    const filteredItems = itemsToShow.filter((item) => {
      if ('id' in item && item.id !== undefined) {
        return !spideredMarkers.has(item.id)
      }
      return true
    })

    const geoJSON =
      filteredItems.length > 0
        ? convertTaskMarkersToGeoJSON(filteredItems as (TaskMarker | TaskCluster)[])
        : ({ type: 'FeatureCollection', features: [] } as GeoJSON.FeatureCollection)

    if (selectedTask?.id) {
      let foundSelected = false
      geoJSON.features = geoJSON.features.map((feature) => {
        if (feature.properties?.id === selectedTask.id) {
          foundSelected = true
          return {
            ...feature,
            properties: {
              ...feature.properties,
              isSelected: true,
            },
          }
        }
        return feature
      })

      // If the selected task wasn't in the API response (e.g. zoomed past its tile),
      // add it as a standalone feature so it remains visible
      if (!foundSelected && selectedTask.location) {
        geoJSON.features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [selectedTask.location.lng, selectedTask.location.lat],
          },
          properties: {
            id: selectedTask.id,
            status: selectedTask.status,
            priority: selectedTask.priority,
            difficulty: 1,
            isSelected: true,
          },
        })
      }
    }

    // Add overlap features
    overlapFeatures.forEach((overlap) => {
      geoJSON.features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: overlap.center },
        properties: {
          id: overlap.tasks[0].id,
          isOverlapping: true,
          overlapId: overlap.id,
          overlapTaskCount: overlap.tasks.length,
          status: 0,
          priority: 0,
          difficulty: 1,
        },
      })
    })

    return geoJSON
  }, [
    useSupercluster,
    markersData,
    spideredMarkers,
    effectiveClustering,
    selectedTask?.id,
    overlappingTaskIds,
    overlapFeatures,
  ])

  // Zoom >= 14: Supercluster-clustered GeoJSON
  const superclusterGeoJSONData = useMemo((): GeoJSON.FeatureCollection => {
    if (!useSupercluster || !superclusterIndex) {
      return { type: 'FeatureCollection', features: [] }
    }

    const clusters = superclusterIndex.getClusters(mapBounds, mapZoom)

    const filteredClusters = clusters.filter((c) => {
      if ('cluster_id' in c.properties && 'point_count' in c.properties) {
        return true
      }
      const taskId = (c.properties as PointProperties).id
      return !spideredMarkers.has(taskId)
    })

    const features = filteredClusters.map((c) => {
      const isCluster =
        c.properties && 'cluster_id' in c.properties && 'point_count' in c.properties

      if (isCluster) {
        const props = c.properties as ClusterProperties
        return {
          type: 'Feature' as const,
          geometry: c.geometry,
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

      const pointProps = c.properties as PointProperties
      return {
        type: 'Feature' as const,
        geometry: c.geometry,
        properties: {
          id: pointProps.id,
          status: pointProps.status,
          priority: pointProps.priority,
          difficulty: pointProps.difficulty,
          isSelected: pointProps.isSelected,
          isOverlapping: pointProps.isOverlapping,
          overlapId: pointProps.overlapId,
          overlapTaskCount: pointProps.overlapTaskCount,
        },
      }
    })

    // Add selected task as a standalone feature so it's never hidden inside a cluster
    if (selectedPointFeature && !spideredMarkers.has(selectedPointFeature.properties.id)) {
      features.push({
        type: 'Feature' as const,
        geometry: selectedPointFeature.geometry,
        properties: {
          id: selectedPointFeature.properties.id,
          status: selectedPointFeature.properties.status,
          priority: selectedPointFeature.properties.priority,
          difficulty: selectedPointFeature.properties.difficulty,
          isSelected: true,
          isOverlapping: undefined,
          overlapId: undefined,
          overlapTaskCount: undefined,
        },
      })
    }

    return { type: 'FeatureCollection', features }
  }, [
    useSupercluster,
    superclusterIndex,
    mapBounds,
    mapZoom,
    spideredMarkers,
    selectedPointFeature,
  ])

  // Unified GeoJSON output
  const clusteredGeoJSONData = useSupercluster ? superclusterGeoJSONData : backendGeoJSONData

  // Style
  const defaultStyle = useMemo(() => {
    const styleSpec = getStyleSpecification('osm-us-vector')
    if (styleSpec) return styleSpec as string | maplibregl.StyleSpecification
    return 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
  }, [])

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return
    const map = mapRef.current.getMap()
    if (!map) return

    createMarkerIcons({ current: map }, () => {
      map.triggerRepaint()
    })
  }, [mapLoaded, mapRef])

  // Bounds handling
  const handleMapMoveEnd = useCallback(() => {
    if (!mapRef.current) return
    const map = mapRef.current.getMap()
    if (!map) return

    if (boundsUpdateTimeoutRef.current) clearTimeout(boundsUpdateTimeoutRef.current)

    boundsUpdateTimeoutRef.current = setTimeout(() => {
      const boundsString = getMapBoundsString(map)
      const currentZoom = Math.floor(map.getZoom())

      if (!bounds || !boundsAreEqual(boundsString, bounds)) {
        setBounds(boundsString)
        lastAppliedBoundsRef.current = boundsString
      }

      if (currentZoom !== zoom) {
        setZoom(currentZoom)
      }
    }, 300)
  }, [setBounds, setZoom, mapRef, bounds, zoom])

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
          { padding: 0, duration: 5000 }
        )
        lastAppliedBoundsRef.current = bounds
        initialBoundsAppliedRef.current = true
      }
    } else {
      initialBoundsAppliedRef.current = true
    }
  }, [mapLoaded, bounds, mapRef])

  // Click handling
  const handleMapClick = useCallback(
    async (e: MapMouseEvent) => {
      if (!e.features || e.features.length === 0) {
        setSpideredMarkers(new Map())
        setSelectedTask(null)
        return
      }

      const feature = e.features[0]
      if (!feature) {
        setSpideredMarkers(new Map())
        setSelectedTask(null)
        return
      }

      if (!mapRef.current) return
      const map = mapRef.current.getMap()
      if (!map) return

      // Spidered marker click — check regular markers and overlap groups
      if (
        feature.layer?.id === 'spidered-markers-layer' &&
        feature.properties?.id !== undefined &&
        feature.geometry.type === 'Point'
      ) {
        const taskId = feature.properties.id as number
        let task = markersData.markers.find((m) => m.id === taskId)
        if (!task) {
          for (const group of overlapGroupsMap.values()) {
            const overlapTask = group.tasks.find((t) => t.id === taskId)
            if (overlapTask) {
              task = overlapTask
              break
            }
          }
        }
        if (task) setSelectedTask(task)
        return
      }

      // Overlap marker click — spider the tasks in the group
      if (
        feature.layer?.id === LAYER_IDS.points &&
        feature.properties?.isOverlapping === true &&
        feature.properties?.overlapId !== undefined &&
        feature.geometry.type === 'Point'
      ) {
        const overlapId = feature.properties.overlapId as string
        const overlapGroup = overlapGroupsMap.get(overlapId)
        if (overlapGroup) {
          const spiderGroup = createSpiderGroup(overlapGroup.tasks, overlapGroup.center, map)
          setSpideredMarkers(spiderGroup)
          setSelectedTask(null)
        }
        return
      }

      // Cluster click - use Supercluster expansion zoom when available
      const isClusterFeature =
        feature.properties?.cluster === true ||
        feature.properties?.cluster_id !== undefined ||
        feature.properties?.point_count !== undefined

      if (isClusterFeature && feature.geometry.type === 'Point') {
        const coordinates = feature.geometry.coordinates as [number, number]
        const clusterId = feature.properties?.cluster_id as number | undefined

        if (clusterId !== undefined && superclusterRef.current) {
          try {
            const expansionZoom = superclusterRef.current.getClusterExpansionZoom(clusterId)
            const maxZoom = map.getMaxZoom()

            // If expansion zoom is at or beyond max zoom, tasks are co-located
            // and can't be separated by zooming — spider them instead
            if (expansionZoom >= maxZoom) {
              const leaves = superclusterRef.current.getLeaves(clusterId, Infinity)
              const leafMarkers: TaskMarker[] = leaves
                .filter((l) => l.properties && 'id' in l.properties)
                .map((l) => {
                  const props = l.properties as PointProperties
                  const coords = l.geometry.coordinates as [number, number]
                  return {
                    id: props.id,
                    location: { lng: coords[0], lat: coords[1] },
                    status: props.status,
                    priority: props.priority,
                  } as TaskMarker
                })

              if (leafMarkers.length > 1) {
                const spiderGroup = createSpiderGroup(leafMarkers, coordinates, map)
                setSpideredMarkers(spiderGroup)
                setSelectedTask(null)
                return
              }
            }

            mapRef.current.easeTo({
              center: coordinates,
              zoom: Math.min(expansionZoom, maxZoom),
              duration: 500,
            })
          } catch {
            const currentZoom = map.getZoom()
            mapRef.current.easeTo({
              center: coordinates,
              zoom: Math.min(currentZoom + 2, map.getMaxZoom()),
              duration: 500,
            })
          }
        } else {
          const currentZoom = map.getZoom()
          mapRef.current.easeTo({
            center: coordinates,
            zoom: Math.min(currentZoom + 2, map.getMaxZoom()),
            duration: 500,
          })
        }
        setSpideredMarkers(new Map())
        return
      }

      // Unclustered point click
      if (
        feature.layer?.id === LAYER_IDS.points &&
        feature.properties?.id !== undefined &&
        feature.geometry.type === 'Point'
      ) {
        const clickPoint = e.point
        const visuallyOverlapping = detectVisualOverlaps(map, clickPoint, LAYER_IDS.points, 15)

        if (visuallyOverlapping.length > 1) {
          const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat]
          const spiderGroup = createSpiderGroup(visuallyOverlapping, coordinates, map)
          setSpideredMarkers(spiderGroup)
          setSelectedTask(null)
          return
        }

        const taskId = feature.properties.id as number
        const task = markersData.markers.find((m) => m.id === taskId)
        if (task) {
          setSpideredMarkers(new Map())
          setSelectedTask(task)
        }
        return
      }

      setSpideredMarkers(new Map())
      setSelectedTask(null)
    },
    [markersData.markers, overlapGroupsMap]
  )

  const handleMapMouseMove = useCallback((e: MapMouseEvent) => {
    if (!mapRef.current) return
    const map = mapRef.current.getMap()
    if (!map) return

    const layersToQuery: string[] = []
    if (map.getLayer(LAYER_IDS.clusters)) layersToQuery.push(LAYER_IDS.clusters)
    if (map.getLayer(LAYER_IDS.clusterCount)) layersToQuery.push(LAYER_IDS.clusterCount)
    if (map.getLayer(LAYER_IDS.points)) layersToQuery.push(LAYER_IDS.points)
    if (map.getLayer('spidered-markers-layer')) layersToQuery.push('spidered-markers-layer')

    if (layersToQuery.length === 0) {
      map.getCanvas().style.cursor = ''
      return
    }

    const features = map.queryRenderedFeatures(e.point, { layers: layersToQuery })

    if (features && features.length > 0) {
      const f = features[0]
      const isInteractive =
        f.properties?.cluster_id !== undefined ||
        f.properties?.point_count !== undefined ||
        f.layer?.id === LAYER_IDS.points ||
        f.layer?.id === LAYER_IDS.clusters ||
        f.layer?.id === LAYER_IDS.clusterCount ||
        f.layer?.id === 'spidered-markers-layer'
      map.getCanvas().style.cursor = isInteractive ? 'pointer' : ''
    } else {
      map.getCanvas().style.cursor = ''
    }
  }, [])

  useEffect(() => {
    return () => {
      if (boundsUpdateTimeoutRef.current) clearTimeout(boundsUpdateTimeoutRef.current)
    }
  }, [])

  return {
    mapRef,
    mapLoaded,
    setMapLoaded,
    isStylePanelOpen,
    setIsStylePanelOpen,
    selectedTask,
    setSelectedTask,
    defaultStyle,
    taskCount,
    cluster,
    isClusteringForced,
    effectiveClustering,
    markersData,
    allMarkersMap,
    isLoadingMarkers,
    handleMapMoveEnd,
    handleMapClick,
    handleMapMouseMove,
    setCluster,
    clusteredGeoJSONData,
    locationGeojson,
    spideredMarkers,
    setSpideredMarkers,
    zoom,
  }
}
