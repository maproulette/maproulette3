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
import {
  calculateTaskCount,
  convertTaskMarkersToGeoJSON,
  processMarkersData,
} from '@/components/shared/TaskMarkers/utils'
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
  isPrimary?: boolean
  isSelected?: boolean
  isLassoSelected?: boolean
  isOverlapping?: boolean
  overlapId?: string
  overlapTaskCount?: number
}

export const useExploreChallengesMap = () => {
  const { cluster, setCluster, locationGeojson, taskMarkerParams, setBounds, bounds } =
    useExploreChallengesSearchContext()
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
  const superclusterRef = useRef<Supercluster<PointProperties, ClusterProperties> | null>(null)
  const [mapZoom, setMapZoom] = useState(2)
  const [mapBounds, setMapBounds] = useState<[number, number, number, number]>([-180, -85, 180, 85])
  const [iconsVersion, setIconsVersion] = useState(0)

  // Fetch data
  const { data: taskMarkersData, isLoading: isLoadingMarkers } =
    api.task.getTaskMarkers(taskMarkerParams)

  const taskCount = useMemo(() => calculateTaskCount(taskMarkersData), [taskMarkersData])

  const markersData = useMemo(() => processMarkersData(taskMarkersData), [taskMarkersData])

  // Auto-disable clustering for small datasets
  useEffect(() => {
    if (taskCount > 0 && taskCount < 100 && cluster) {
      setCluster(false)
    }
  }, [taskCount, cluster, setCluster])

  const shouldCluster = useMemo(() => {
    if (taskCount >= 500) return true
    return cluster
  }, [taskCount, cluster])

  // Convert all markers (individual + server clusters) to GeoJSON
  const geoJSONData = useMemo(() => {
    const allItems = [...markersData.markers, ...markersData.clusters]
    if (allItems.length > 0) {
      return convertTaskMarkersToGeoJSON(allItems as TaskMarker[])
    }
    return {
      type: 'FeatureCollection',
      features: [],
    } as GeoJSON.FeatureCollection
  }, [markersData])

  // Convert to point features for Supercluster (skip server-pre-computed clusters)
  const pointFeatures = useMemo(() => {
    return geoJSONData.features
      .filter((f): f is GeoJSON.Feature<GeoJSON.Point> => f.geometry.type === 'Point')
      .filter((f) => !f.properties?.cluster)
      .map((feature) => {
        const taskId = feature.properties?.id as number | undefined
        const isSelected = taskId === selectedTask?.id

        return {
          type: 'Feature' as const,
          geometry: feature.geometry,
          properties: {
            cluster: false as const,
            id: taskId as number,
            status: feature.properties?.status as number,
            priority: feature.properties?.priority as number,
            difficulty: feature.properties?.difficulty as number,
            isHighlighted: false,
            isPrimary: false,
            isSelected,
            isLassoSelected: false,
            isOverlapping: false,
          },
        }
      })
  }, [geoJSONData, selectedTask?.id])

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

  // Build Supercluster indices
  const { clusteredIndex, unclusteredIndex } = useMemo(() => {
    if (pointFeatures.length === 0) {
      return { clusteredIndex: null, unclusteredIndex: null }
    }

    const opts = { maxZoom: 16, minZoom: 0 }

    const clustered = new Supercluster<PointProperties, ClusterProperties>({ ...opts, radius: 25 })
    clustered.load(pointFeatures)

    const unclustered = new Supercluster<PointProperties, ClusterProperties>({ ...opts, radius: 0 })
    unclustered.load(pointFeatures)

    return { clusteredIndex: clustered, unclusteredIndex: unclustered }
  }, [pointFeatures])

  const isClusteringForced = mapZoom < 2

  const superclusterIndex = useMemo(() => {
    if (shouldCluster || isClusteringForced) {
      superclusterRef.current = clusteredIndex
      return clusteredIndex
    }
    superclusterRef.current = unclusteredIndex
    return unclusteredIndex
  }, [clusteredIndex, unclusteredIndex, shouldCluster, isClusteringForced])

  // Get clusters for current viewport
  const clusteredGeoJSONData = useMemo((): GeoJSON.FeatureCollection => {
    if (!superclusterIndex) {
      // Fall back to showing server clusters if we have them and no individual markers
      if (markersData.clusters.length > 0 && pointFeatures.length === 0) {
        return convertTaskMarkersToGeoJSON(markersData.clusters as TaskCluster[])
      }
      return { type: 'FeatureCollection', features: [] }
    }

    const effectiveZoom = mapZoom < 2 ? 0 : mapZoom
    const clusters = superclusterIndex.getClusters(mapBounds, effectiveZoom)

    const filteredClusters = clusters.filter((c) => {
      if ('cluster_id' in c.properties && 'point_count' in c.properties) return true
      const taskId = (c.properties as PointProperties).id
      return !spideredMarkers.has(taskId)
    })

    const features = filteredClusters.map((c) => {
      const isClusterItem =
        c.properties && 'cluster_id' in c.properties && 'point_count' in c.properties

      if (isClusterItem) {
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
          isHighlighted: pointProps.isHighlighted,
          isPrimary: pointProps.isPrimary,
          isSelected: pointProps.isSelected,
          isLassoSelected: pointProps.isLassoSelected,
          isOverlapping: pointProps.isOverlapping,
          overlapId: pointProps.overlapId,
          overlapTaskCount: pointProps.overlapTaskCount,
        },
      }
    })

    return { type: 'FeatureCollection', features }
  }, [
    superclusterIndex,
    mapBounds,
    mapZoom,
    iconsVersion,
    spideredMarkers,
    markersData.clusters,
    pointFeatures.length,
  ])

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
      setIconsVersion((v) => v + 1)
    })
  }, [mapLoaded, mapRef, shouldCluster])

  // Bounds handling
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

      // Cluster click
      const isClusterFeature =
        feature.properties?.cluster_id !== undefined ||
        feature.properties?.point_count !== undefined

      if (isClusterFeature && feature.geometry.type === 'Point') {
        const coordinates = feature.geometry.coordinates as [number, number]
        const clusterId = feature.properties.cluster_id

        if (clusterId !== undefined && superclusterRef.current) {
          try {
            const zoom = superclusterRef.current.getClusterExpansionZoom(clusterId)
            mapRef.current.easeTo({
              center: coordinates,
              zoom: Math.min(zoom, map.getMaxZoom()),
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
    shouldCluster,
    isClusteringForced,
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
  }
}
