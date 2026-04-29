import type maplibregl from 'maplibre-gl'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MapMouseEvent, MapRef } from 'react-map-gl/maplibre'
import Supercluster from 'supercluster'
import { getStyleSpecification } from '@/components/Map/mapStyles'
import {
  boundsAreEqual,
  fitMapToBounds,
  getMapBoundsString,
  isWorldBounds,
  parseBoundsString,
} from '@/components/Map/mapUtils'
import { LAYER_IDS } from '@/components/Map/TaskMarkers/const'
import { createMarkerIcons } from '@/components/Map/TaskMarkers/createMarkerIcons'
import { createSpiderGroup, detectVisualOverlaps } from '@/components/Map/TaskMarkers/spiderUtils'
import type { TaskTypeKey } from '@/components/Map/TaskMarkers/taskTypes'
import { useChallengeTypes } from '@/components/Map/TaskMarkers/useChallengeTypes'
import type { TaskMarker } from '@/types/Task'
import { useExploreChallengesSearchContext } from '../contexts/ExploreChallengesSearchContext'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:9000'
const MVT_SOURCE_ID = 'mvt-data'
const MVT_SOURCE_LAYER = 'default'
const FILTER_MIN_ZOOM = 14

interface PointProperties {
  id?: number
  status?: number
  priority?: number
  challenge_id?: number
  typeKey?: TaskTypeKey | null
  group_type: number
  task_count: number
  task_ids_str?: string
  isOverlapping?: boolean
  overlapTaskCount?: number
  _weight: number
}

interface ClusterProperties {
  totalCount: number
}

// Module-level constant: style specification is static and never changes at runtime
const DEFAULT_MAP_STYLE: string | maplibregl.StyleSpecification =
  (getStyleSpecification('osm-us-vector') as string | maplibregl.StyleSpecification) ??
  'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'

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
  const [spideredTaskData, setSpideredTaskData] = useState<TaskMarker[]>([])
  const boundsUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const initialBoundsAppliedRef = useRef(false)
  const lastAppliedBoundsRef = useRef<string | null>(null)

  const [extractedFeatures, setExtractedFeatures] = useState<GeoJSON.Feature<GeoJSON.Point>[]>([])
  const [mapZoom, setMapZoom] = useState(2)
  const [mapBounds, setMapBounds] = useState<[number, number, number, number]>([-180, -85, 180, 85])
  const superclusterRef = useRef<Supercluster<PointProperties, ClusterProperties> | null>(null)

  const hasActiveFilters = useMemo(() => {
    const hasKeywords = (taskTilesParams.keywords?.trim().length ?? 0) > 0
    const hasLocation = taskTilesParams.location_id != null
    return hasKeywords || hasLocation
  }, [taskTilesParams.keywords, taskTilesParams.location_id])

  const filterZoomNotice = useMemo(() => {
    if (hasActiveFilters && zoom < FILTER_MIN_ZOOM) {
      return 'Zoom in to see filtered results (zoom 14+)'
    }
    return null
  }, [hasActiveFilters, zoom])

  const tileUrl = useMemo(() => {
    const params = new URLSearchParams()
    if (taskTilesParams.global !== undefined) {
      params.set('global', String(taskTilesParams.global))
    }
    if (taskTilesParams.difficulty !== undefined) {
      params.set('difficulty', String(taskTilesParams.difficulty))
    }
    if (taskTilesParams.keywords) {
      params.set('keywords', taskTilesParams.keywords)
    }
    if (taskTilesParams.location_id !== undefined) {
      params.set('location_id', String(taskTilesParams.location_id))
    }
    const qs = params.toString()
    return `${API_BASE_URL}/api/v2/taskTilesMvt/{z}/{x}/{y}${qs ? `?${qs}` : ''}`
  }, [
    taskTilesParams.global,
    taskTilesParams.difficulty,
    taskTilesParams.keywords,
    taskTilesParams.location_id,
  ])

  const selectedTaskGeoJSON = useMemo((): GeoJSON.FeatureCollection => {
    if (!selectedTask?.location) {
      return { type: 'FeatureCollection', features: [] }
    }
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [selectedTask.location.lng, selectedTask.location.lat],
          },
          properties: {
            id: selectedTask.id,
            status: selectedTask.status,
            priority: selectedTask.priority,
            isSelected: true,
          },
        },
      ],
    }
  }, [selectedTask])

  const defaultStyle = DEFAULT_MAP_STYLE

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return
    const map = mapRef.current.getMap()
    if (!map) return

    createMarkerIcons({ current: map }, () => {
      map.triggerRepaint()
    })
  }, [mapLoaded, mapRef])

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return
    const map = mapRef.current.getMap()
    if (!map) return

    let debounceTimeout: NodeJS.Timeout | null = null

    const extractFeatures = () => {
      if (!map.getSource(MVT_SOURCE_ID)) return

      const features = map.querySourceFeatures(MVT_SOURCE_ID, {
        sourceLayer: MVT_SOURCE_LAYER,
      })

      const b = map.getBounds()
      const buffer = 1
      const west = b.getWest() - buffer
      const east = b.getEast() + buffer
      const south = b.getSouth() - buffer
      const north = b.getNorth() + buffer

      const seen = new Map<string, GeoJSON.Feature<GeoJSON.Point>>()
      for (const f of features) {
        if (f.geometry.type !== 'Point') continue
        const [lng, lat] = (f.geometry as GeoJSON.Point).coordinates

        if (lng < west || lng > east || lat < south || lat > north) continue

        const props = f.properties || {}
        let key: string
        if (props.group_type === 0 && props.id != null) {
          key = `s-${props.id}`
        } else if (props.group_type === 1 && props.task_ids_str) {
          key = `o-${props.task_ids_str}`
        } else {
          key = `c-${lng.toFixed(5)}-${lat.toFixed(5)}-${props.task_count}`
        }
        if (!seen.has(key)) {
          seen.set(key, f as GeoJSON.Feature<GeoJSON.Point>)
        }
      }

      setExtractedFeatures(Array.from(seen.values()))
    }

    const debouncedExtract = () => {
      if (debounceTimeout) clearTimeout(debounceTimeout)
      debounceTimeout = setTimeout(extractFeatures, 150)
    }

    const onSourceData = (e: maplibregl.MapSourceDataEvent) => {
      if (e.sourceId === MVT_SOURCE_ID && e.isSourceLoaded) {
        debouncedExtract()
      }
    }

    map.on('sourcedata', onSourceData)
    map.on('moveend', debouncedExtract)

    return () => {
      map.off('sourcedata', onSourceData)
      map.off('moveend', debouncedExtract)
      if (debounceTimeout) clearTimeout(debounceTimeout)
    }
  }, [mapLoaded])

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

  const { backendClusterFeatures, pointFeatures } = useMemo(() => {
    const backendClusters: GeoJSON.Feature<GeoJSON.Point>[] = []
    const points: Supercluster.PointFeature<PointProperties>[] = []

    for (const f of extractedFeatures) {
      const props = f.properties || {}
      const groupType = (props.group_type as number) ?? 0
      const taskCount = (props.task_count as number) || 1

      if (groupType === 2) {
        backendClusters.push(f)
        continue
      }

      const pointProps: PointProperties = {
        group_type: groupType,
        task_count: taskCount,
        _weight: taskCount,
      }

      if (groupType === 0) {
        const taskStatus = (props.status as number) ?? 0

        if (taskStatus !== 0) continue
        pointProps.id = props.id as number
        pointProps.status = taskStatus
        pointProps.priority = (props.priority as number) ?? 0
        if (props.challenge_id != null) {
          pointProps.challenge_id = props.challenge_id as number
        }
      } else if (groupType === 1) {
        pointProps.isOverlapping = true
        pointProps.overlapTaskCount = taskCount
        pointProps.task_ids_str = props.task_ids_str as string
        const firstId = (props.task_ids_str as string)?.split(',')[0]
        if (firstId) pointProps.id = Number(firstId)
      }

      points.push({
        type: 'Feature' as const,
        geometry: f.geometry,
        properties: pointProps,
      })
    }

    return { backendClusterFeatures: backendClusters, pointFeatures: points }
  }, [extractedFeatures])

  const { clusteredIndex, unclusteredIndex } = useMemo(() => {
    if (pointFeatures.length === 0) {
      return { clusteredIndex: null, unclusteredIndex: null }
    }

    const mapFn = (props: PointProperties) => ({ totalCount: props._weight || 1 })
    const reduceFn = (acc: ClusterProperties, props: ClusterProperties) => {
      acc.totalCount += props.totalCount
    }

    const clustered = new Supercluster<PointProperties, ClusterProperties>({
      radius: 25,
      maxZoom: 16,
      map: mapFn,
      reduce: reduceFn,
    })
    clustered.load(pointFeatures)

    const unclustered = new Supercluster<PointProperties, ClusterProperties>({
      radius: 0,
      maxZoom: 16,
      map: mapFn,
      reduce: reduceFn,
    })
    unclustered.load(pointFeatures)

    return { clusteredIndex: clustered, unclusteredIndex: unclustered }
  }, [pointFeatures])

  const superclusterIndex = useMemo(() => {
    const index = cluster ? clusteredIndex : unclusteredIndex
    superclusterRef.current = index
    return index
  }, [clusteredIndex, unclusteredIndex, cluster])

  const visibleChallengeIds = useMemo(() => {
    const ids = new Set<number>()
    for (const p of pointFeatures) {
      const cid = p.properties.challenge_id
      if (cid != null) ids.add(cid)
    }
    return Array.from(ids)
  }, [pointFeatures])
  const challengeTypeMap = useChallengeTypes(visibleChallengeIds)

  const clusteredGeoJSONData = useMemo((): GeoJSON.FeatureCollection => {
    const features: GeoJSON.Feature[] = []

    for (const f of backendClusterFeatures) {
      const taskCount = (f.properties?.task_count as number) || 1
      features.push({
        type: 'Feature',
        geometry: f.geometry,
        properties: {
          point_count: taskCount,
          point_count_abbreviated:
            taskCount >= 1000 ? `${Math.round(taskCount / 1000)}k` : String(taskCount),
        },
      })
    }

    if (superclusterIndex) {
      const clusters = superclusterIndex.getClusters(mapBounds, mapZoom)

      for (const c of clusters) {
        if ((c.properties as ClusterProperties & { cluster: true }).cluster) {
          const clusterProps = c.properties as ClusterProperties & {
            cluster: true
            cluster_id: number
            point_count: number
          }
          const count = clusterProps.totalCount || clusterProps.point_count
          features.push({
            type: 'Feature',
            geometry: c.geometry,
            properties: {
              cluster: true,
              cluster_id: clusterProps.cluster_id,
              point_count: count,
              point_count_abbreviated:
                count >= 1000 ? `${Math.round(count / 1000)}k` : String(count),
            },
          })
          continue
        }

        const pointProps = c.properties as PointProperties
        if (pointProps.id != null && spideredMarkers.has(pointProps.id)) continue

        const typeKey =
          pointProps.challenge_id != null
            ? (challengeTypeMap.get(pointProps.challenge_id) ?? null)
            : null

        features.push({
          type: 'Feature',
          geometry: c.geometry,
          properties: {
            id: pointProps.id,
            status: pointProps.status ?? 0,
            priority: pointProps.priority ?? 0,
            isOverlapping: pointProps.isOverlapping ?? false,
            overlapTaskCount: pointProps.overlapTaskCount,
            task_ids_str: pointProps.task_ids_str,
            group_type: pointProps.group_type,
            task_count: pointProps.task_count,
            challenge_id: pointProps.challenge_id,
            typeKey: typeKey ?? undefined,
          },
        })
      }
    }

    return { type: 'FeatureCollection', features }
  }, [superclusterIndex, backendClusterFeatures, mapBounds, mapZoom, spideredMarkers])

  const handleMapMove = useCallback(() => {
    if (!mapRef.current) return
    const map = mapRef.current.getMap()
    if (!map) return
    const currentZoom = Math.floor(map.getZoom())
    if (currentZoom !== zoom) {
      setZoom(currentZoom)
    }
  }, [setZoom, mapRef, zoom])

  const handleMapMoveEnd = useCallback(() => {
    if (!mapRef.current) return
    const map = mapRef.current.getMap()
    if (!map) return

    if (boundsUpdateTimeoutRef.current) clearTimeout(boundsUpdateTimeoutRef.current)

    boundsUpdateTimeoutRef.current = setTimeout(() => {
      const boundsString = getMapBoundsString(map)

      if (!bounds || !boundsAreEqual(boundsString, bounds)) {
        setBounds(boundsString)
        lastAppliedBoundsRef.current = boundsString
      }
    }, 300)
  }, [setBounds, mapRef, bounds])

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

  const handleMapClick = useCallback(async (e: MapMouseEvent) => {
    if (!e.features || e.features.length === 0) {
      setSpideredMarkers(new Map())
      setSpideredTaskData([])
      setSelectedTask(null)
      return
    }

    const feature = e.features[0]
    if (!feature) {
      setSpideredMarkers(new Map())
      setSpideredTaskData([])
      setSelectedTask(null)
      return
    }

    if (!mapRef.current) return
    const map = mapRef.current.getMap()
    if (!map) return

    if (
      feature.layer?.id === 'spidered-markers-layer' &&
      feature.properties?.id !== undefined &&
      feature.geometry.type === 'Point'
    ) {
      const taskId = feature.properties.id as number
      const coords = feature.geometry.coordinates as [number, number]
      setSelectedTask({
        id: taskId,
        location: { lng: coords[0], lat: coords[1] },
        status: (feature.properties.status as number) ?? 0,
        priority: (feature.properties.priority as number) ?? 0,
      })
      return
    }

    const isClusterFeature =
      feature.properties?.cluster_id !== undefined || feature.properties?.point_count !== undefined

    if (isClusterFeature && feature.geometry.type === 'Point') {
      const coordinates = feature.geometry.coordinates as [number, number]
      const clusterId = feature.properties.cluster_id as number | undefined

      if (clusterId !== undefined && superclusterRef.current) {
        try {
          const expansionZoom = superclusterRef.current.getClusterExpansionZoom(clusterId)
          mapRef.current.flyTo({
            center: coordinates,
            zoom: Math.min(expansionZoom, map.getMaxZoom()),
            duration: 600,
          })
        } catch {
          const currentZoom = map.getZoom()
          mapRef.current.flyTo({
            center: coordinates,
            zoom: Math.min(currentZoom + 2, map.getMaxZoom()),
            duration: 600,
          })
        }
      } else {
        const currentZoom = map.getZoom()
        mapRef.current.flyTo({
          center: coordinates,
          zoom: Math.min(currentZoom + 2, map.getMaxZoom()),
          duration: 600,
        })
      }
      setSpideredMarkers(new Map())
      setSpideredTaskData([])
      return
    }

    if (
      feature.layer?.id === LAYER_IDS.points &&
      feature.properties?.isOverlapping === true &&
      feature.geometry.type === 'Point'
    ) {
      const taskIdsStr = feature.properties?.task_ids_str as string | undefined
      if (taskIdsStr) {
        const taskIds = taskIdsStr.split(',').map(Number)
        const coords = feature.geometry.coordinates as [number, number]
        const tasks: TaskMarker[] = taskIds.map((id) => ({
          id,
          location: { lng: coords[0], lat: coords[1] },
          status: 0,
          priority: 0,
        }))
        const spiderGroup = createSpiderGroup(tasks, coords, map)
        setSpideredMarkers(spiderGroup)
        setSpideredTaskData(tasks)
        setSelectedTask(null)
      }
      return
    }

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
        setSpideredTaskData(visuallyOverlapping)
        setSelectedTask(null)
        return
      }

      const taskId = feature.properties.id as number
      const coords = feature.geometry.coordinates as [number, number]
      setSpideredMarkers(new Map())
      setSpideredTaskData([])
      setSelectedTask({
        id: taskId,
        location: { lng: coords[0], lat: coords[1] },
        status: (feature.properties.status as number) ?? 0,
        priority: (feature.properties.priority as number) ?? 0,
      })
      return
    }

    setSpideredMarkers(new Map())
    setSpideredTaskData([])
    setSelectedTask(null)
  }, [])

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
      const isCluster =
        f.properties?.cluster_id !== undefined || f.properties?.point_count !== undefined
      const isMarker =
        f.layer?.id === LAYER_IDS.points ||
        f.layer?.id === LAYER_IDS.clusters ||
        f.layer?.id === LAYER_IDS.clusterCount ||
        f.layer?.id === 'spidered-markers-layer'

      if (isCluster || isMarker) {
        map.getCanvas().style.cursor = 'pointer'
      } else {
        map.getCanvas().style.cursor = ''
      }
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
    cluster,
    tileUrl,
    selectedTaskGeoJSON,
    clusteredGeoJSONData,
    handleMapMove,
    handleMapMoveEnd,
    handleMapClick,
    handleMapMouseMove,
    setCluster,
    locationGeojson,
    spideredMarkers,
    spideredTaskData,
    setSpideredMarkers,
    setSpideredTaskData,
    zoom,
    filterZoomNotice,
  }
}
