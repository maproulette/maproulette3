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
import type { TaskMarker, TileCluster } from '@/types/Task'
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

// Backend API thresholds for task markers
// See: GET /taskMarkers endpoint documentation
const CLUSTER_THRESHOLD = 500 // Above this, API forces clustering regardless of cluster param
const COUNT_ONLY_THRESHOLD = 10000 // Above this, API returns only count (no markers/clusters)

// At this zoom level and above, per-tile fetching + client-side Supercluster is used
const SUPERCLUSTER_ZOOM = 14

interface PointProperties {
  cluster?: false
  id: number
  status: number
  priority: number
  difficulty: number
  isSelected?: boolean
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
    }),
    [taskTilesData]
  )

  // Determine if clustering is forced by the backend due to task count
  // Only applies at zoom < 14 (backend path) — at zoom 14+ Supercluster handles it client-side
  const isClusteringForced = useMemo(
    () => !useSupercluster && taskCount > CLUSTER_THRESHOLD,
    [useSupercluster, taskCount]
  )

  // Determine if only count is returned (no markers/clusters) due to very high task count
  const isCountOnly = useMemo(() => taskCount > COUNT_ONLY_THRESHOLD, [taskCount])

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
  const { pointFeatures, selectedPointFeature } = useMemo(() => {
    if (!useSupercluster || markersData.markers.length === 0) {
      return { pointFeatures: [], selectedPointFeature: null }
    }

    type PointFeature = {
      type: 'Feature'
      geometry: { type: 'Point'; coordinates: [number, number] }
      properties: PointProperties
    }

    let selected: PointFeature | null = null
    const features: PointFeature[] = markersData.markers
      .filter((m) => m.location)
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

    const clusterableFeatures = features.filter((f) => {
      if (f.properties.id === selectedTask?.id) {
        selected = f
        return false
      }
      return true
    })

    return {
      pointFeatures: clusterableFeatures,
      selectedPointFeature: selected as PointFeature | null,
    }
  }, [useSupercluster, markersData.markers, selectedTask?.id])

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

    const itemsToShow = effectiveClustering
      ? [...markersData.markers, ...markersData.clusters]
      : markersData.markers

    const filteredItems = itemsToShow.filter((item) => {
      if ('id' in item && item.id !== undefined) {
        return !spideredMarkers.has(item.id)
      }
      return true
    })

    if (filteredItems.length > 0) {
      const geoJSON = convertTaskMarkersToGeoJSON(filteredItems as (TaskMarker | TileCluster)[])

      if (selectedTask?.id) {
        geoJSON.features = geoJSON.features.map((feature) => {
          if (feature.properties?.id === selectedTask.id) {
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
      }

      return geoJSON
    }
    return { type: 'FeatureCollection', features: [] }
  }, [useSupercluster, markersData, spideredMarkers, effectiveClustering, selectedTask?.id])

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

      // Spidered marker click
      if (
        feature.layer?.id === 'spidered-markers-layer' &&
        feature.properties?.id !== undefined &&
        feature.geometry.type === 'Point'
      ) {
        const taskId = feature.properties.id as number
        const task = markersData.markers.find((m) => m.id === taskId)
        if (task) setSelectedTask(task)
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
            mapRef.current.easeTo({
              center: coordinates,
              zoom: Math.min(expansionZoom, map.getMaxZoom()),
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
    [markersData.markers]
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
    isCountOnly,
    effectiveClustering,
    markersData,
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
