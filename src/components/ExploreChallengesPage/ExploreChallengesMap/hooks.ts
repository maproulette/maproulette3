import type maplibregl from 'maplibre-gl'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MapMouseEvent, MapRef } from 'react-map-gl/maplibre'
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
import type { TaskMarker } from '@/types/Task'
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

  // Fetch data - cluster param is passed to API which returns pre-clustered data
  const { data: taskMarkersData, isLoading: isLoadingMarkers } =
    api.task.getTaskMarkers(taskMarkerParams)

  const taskCount = useMemo(() => calculateTaskCount(taskMarkersData), [taskMarkersData])

  const markersData = useMemo(() => processMarkersData(taskMarkersData), [taskMarkersData])

  // Determine if clustering is forced by the backend due to task count
  // Backend forces clustering when taskCount > 1000, regardless of cluster param
  const isClusteringForced = useMemo(() => taskCount > CLUSTER_THRESHOLD, [taskCount])

  // Determine if only count is returned (no markers/clusters) due to very high task count
  const isCountOnly = useMemo(() => taskCount > COUNT_ONLY_THRESHOLD, [taskCount])

  // Effective clustering state - true if user enabled OR backend forces it
  const effectiveClustering = useMemo(
    () => cluster || isClusteringForced,
    [cluster, isClusteringForced]
  )

  // Convert API data (markers + clusters) to GeoJSON for rendering
  // When effectiveClustering=true: show both markers and clusters from API
  // When effectiveClustering=false: show only individual markers (filter out clusters)
  const clusteredGeoJSONData = useMemo((): GeoJSON.FeatureCollection => {
    // When clustering is disabled AND not forced, only show individual markers
    const itemsToShow = effectiveClustering
      ? [...markersData.markers, ...markersData.clusters]
      : markersData.markers

    // Filter out spidered markers from the main layer
    const filteredItems = itemsToShow.filter((item) => {
      if ('id' in item && item.id !== undefined) {
        return !spideredMarkers.has(item.id)
      }
      return true
    })

    if (filteredItems.length > 0) {
      const geoJSON = convertTaskMarkersToGeoJSON(filteredItems as TaskMarker[])

      // Apply selected state to the selected task marker
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
    return {
      type: 'FeatureCollection',
      features: [],
    } as GeoJSON.FeatureCollection
  }, [markersData, spideredMarkers, effectiveClustering, selectedTask?.id])

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

      // Cluster click - zoom in on the cluster location
      const isClusterFeature =
        feature.properties?.cluster === true || feature.properties?.point_count !== undefined

      if (isClusterFeature && feature.geometry.type === 'Point') {
        const coordinates = feature.geometry.coordinates as [number, number]
        const currentZoom = map.getZoom()
        mapRef.current.easeTo({
          center: coordinates,
          zoom: Math.min(currentZoom + 2, map.getMaxZoom()),
          duration: 500,
        })
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
  }
}
