import bbox from '@turf/bbox'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MapMouseEvent, MapRef } from 'react-map-gl/maplibre'
import Supercluster from 'supercluster'
import { api } from '@/api'
import { mapBoundsToBbox } from '@/components/Map/mapUtils'
import { flyToClusterExpansion } from '@/components/Map/TaskMarkers/clusterUtils'
import { LAYER_IDS } from '@/components/Map/TaskMarkers/const'
import { createMarkerIcons } from '@/components/Map/TaskMarkers/createMarkerIcons'
import { createSpiderGroup, detectVisualOverlaps } from '@/components/Map/TaskMarkers/spiderUtils'
import {
  calculateTaskCount,
  convertTaskMarkersToGeoJSON,
  processMarkersData,
} from '@/components/Map/TaskMarkers/utils'
import type { Bbox2D } from '@/types/Map'
import type { TaskMarker } from '@/types/Task'
import { useBrowsedChallengeContext } from '../contexts/BrowsedChallengeContext'

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
  isHighlighted?: boolean
  isPrimary?: boolean
  isSelected?: boolean
  isLassoSelected?: boolean
  isOverlapping?: boolean
  overlapId?: string
  overlapTaskCount?: number
}

export const useBrowseChallengeMap = () => {
  // All useMemo/useCallback hooks below provide stable references for map rendering.
  // The map component re-renders on every viewport change, so stable GeoJSON objects,
  // Supercluster indices, and event handlers prevent unnecessary recomputation and repaints.
  const { challenge } = useBrowsedChallengeContext()
  const mapRef = useRef<MapRef | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [selectedTask, setSelectedTask] = useState<TaskMarker | null>(null)
  const [cluster, setCluster] = useState<boolean>(true)
  const [spideredMarkers, setSpideredMarkers] = useState<
    Map<number, { original: [number, number]; spidered: [number, number] }>
  >(new Map())
  const initialBoundsAppliedRef = useRef(false)

  const [initialViewState] = useState(() => ({ longitude: 0, latitude: 0, zoom: 0 }))
  const [initialHash] = useState(() => window.location.hash)

  const superclusterRef = useRef<Supercluster<PointProperties, ClusterProperties> | null>(null)
  const [mapZoom, setMapZoom] = useState(2)
  const [mapBounds, setMapBounds] = useState<Bbox2D>([-180, -85, 180, 85])
  const [iconsVersion, setIconsVersion] = useState(0)

  const { data: taskMarkersData, isLoading: isLoadingMarkers } =
    api.challenge.getChallengeTaskMarkers(challenge.id)

  // Reason: Sorting/filtering large arrays — aggregates task counts from raw marker data
  const taskCount = useMemo(() => calculateTaskCount(taskMarkersData), [taskMarkersData])

  // Reason: Builds lookup map from array (expensive for large datasets)
  const markersData = useMemo(() => processMarkersData(taskMarkersData), [taskMarkersData])

  const shouldCluster = cluster

  // Reason: GeoJSON processing — converts raw markers into GeoJSON FeatureCollection
  const geoJSONData = useMemo(() => {
    if (markersData.markers.length > 0) {
      return convertTaskMarkersToGeoJSON(markersData.markers as TaskMarker[])
    }
    return {
      type: 'FeatureCollection',
      features: [],
    } as GeoJSON.FeatureCollection
  }, [markersData.markers])

  // Reason: GeoJSON processing — filters and maps features into Supercluster input format
  const pointFeatures = useMemo(() => {
    const features = geoJSONData.features
      .filter((f): f is GeoJSON.Feature<GeoJSON.Point> => f.geometry.type === 'Point')
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
            isHighlighted: false,
            isPrimary: false,
            isSelected,
            isLassoSelected: false,
            isOverlapping: false,
          },
        }
      })

    return features
  }, [geoJSONData, selectedTask?.id])

  // Track map viewport for Supercluster
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return

    const map = mapRef.current.getMap()
    if (!map) return

    const updateViewport = () => {
      setMapBounds(mapBoundsToBbox(map.getBounds()))
      setMapZoom(Math.floor(map.getZoom()))
    }

    updateViewport()

    map.on('move', updateViewport)
    map.on('moveend', updateViewport)

    return () => {
      map.off('move', updateViewport)
      map.off('moveend', updateViewport)
    }
  }, [mapLoaded])

  // Reason: Supercluster index building (expensive computation)
  const { clusteredIndex, unclusteredIndex } = useMemo(() => {
    if (pointFeatures.length === 0) {
      return { clusteredIndex: null, unclusteredIndex: null }
    }

    // maxZoom caps the zoom level at which Supercluster keeps re-splitting
    // clusters. Past this zoom getClusters() returns the frozen cluster from
    // maxZoom, so a dense challenge looks like a single bubble that never
    // breaks apart even at street level. 22 matches the map's max user zoom
    // so clusters keep splitting all the way down to individual markers.
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

  const isClusteringForced = mapZoom < 2

  // Reason: Stable reference needed as dependency for clusteredGeoJSONData
  const superclusterIndex = useMemo(() => {
    if (cluster || isClusteringForced) {
      superclusterRef.current = clusteredIndex
      return clusteredIndex
    }
    superclusterRef.current = unclusteredIndex
    return unclusteredIndex
  }, [clusteredIndex, unclusteredIndex, cluster, isClusteringForced])

  // Reason: Passed to map component that would re-render without stable reference
  const clusteredGeoJSONData = useMemo((): GeoJSON.FeatureCollection => {
    if (!superclusterIndex) {
      return { type: 'FeatureCollection', features: [] }
    }

    const effectiveZoom = mapZoom < 2 ? 0 : mapZoom
    const clusters = superclusterIndex.getClusters(mapBounds, effectiveZoom)

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

    return {
      type: 'FeatureCollection',
      features,
    }
  }, [superclusterIndex, mapBounds, mapZoom, iconsVersion, spideredMarkers])

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return

    const map = mapRef.current.getMap()
    if (!map) return

    createMarkerIcons({ current: map }, () => {
      map.triggerRepaint()
      setIconsVersion((v) => v + 1)
    })
  }, [mapLoaded, mapRef, shouldCluster])

  // Reason: GeoJSON processing — computes bounding box from all marker coordinates
  const allTagsBounds = useMemo<Bbox2D | null>(() => {
    if (!geoJSONData || geoJSONData.features.length === 0) return null
    return bbox(geoJSONData) as Bbox2D
  }, [geoJSONData])

  // Load initial bounds from URL hash, or fit to all tags
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || initialBoundsAppliedRef.current) return

    // A custom extent was present in the URL when the page loaded; leave it be.
    if (initialHash.length > 1) {
      initialBoundsAppliedRef.current = true
      return
    }

    if (isLoadingMarkers) return

    const map = mapRef.current.getMap()
    if (!map) return

    if (allTagsBounds) {
      map.fitBounds(allTagsBounds, {
        padding: 50,
        duration: 1000,
        maxZoom: 16,
      })
    }
    initialBoundsAppliedRef.current = true
  }, [mapLoaded, allTagsBounds, isLoadingMarkers, mapRef, initialHash])

  // Reason: Stable reference needed — passed as onClick handler to map controls
  const zoomToAllTags = useCallback(() => {
    if (!mapRef.current || !allTagsBounds) return

    const map = mapRef.current.getMap()
    if (!map) return

    map.fitBounds(allTagsBounds, {
      padding: 50,
      duration: 1000,
      maxZoom: 16,
    })
  }, [allTagsBounds])

  // Reason: Passed to map component that would re-render without stable reference
  const handleMapClick = useCallback(
    async (e: MapMouseEvent) => {
      const clearSelection = () => {
        if (e.originalEvent?.isTrusted === false) return
        setSpideredMarkers(new Map())
        setSelectedTask(null)
      }
      if (!e.features || e.features.length === 0) {
        clearSelection()
        return
      }

      const feature = e.features[0]
      if (!feature) {
        clearSelection()
        return
      }

      if (!mapRef.current) return

      const map = mapRef.current.getMap()
      if (!map) return

      // Check if clicking on a spidered marker
      const isSpideredMarker =
        feature.layer?.id === 'spidered-markers-layer' &&
        feature.properties?.id !== undefined &&
        feature.geometry.type === 'Point'

      if (isSpideredMarker) {
        const taskId = feature.properties.id as number
        const task = markersData.markers.find((m) => m.id === taskId)
        if (task) {
          setSelectedTask(task)
        }
        return
      }

      // Check if clicking on a cluster - use Supercluster expansion zoom
      const isClusterFeature =
        feature.properties?.cluster_id !== undefined ||
        feature.properties?.point_count !== undefined

      if (isClusterFeature && feature.geometry.type === 'Point') {
        const coordinates = feature.geometry.coordinates as [number, number]
        const clusterId = feature.properties.cluster_id as number | undefined
        flyToClusterExpansion(map, superclusterRef.current, clusterId, coordinates)
        setSpideredMarkers(new Map())
        return
      }

      // Check if clicking on a regular unclustered point
      const isUnclusteredPoint =
        LAYER_IDS.allPoints.includes(feature.layer?.id ?? '') &&
        feature.properties?.id !== undefined &&
        feature.geometry.type === 'Point'

      if (isUnclusteredPoint) {
        // Check for visual overlaps at click point
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
          setSelectedTask(null)
          return
        }

        // Single marker - show drawer
        const taskId = feature.properties.id as number
        const task = markersData.markers.find((m) => m.id === taskId)
        if (task) {
          setSpideredMarkers(new Map())
          setSelectedTask(task)
        }
        return
      }

      // Clicked on something else - clear state
      clearSelection()
    },
    [markersData.markers]
  )

  // Reason: Passed to map component that would re-render without stable reference
  const handleMapMouseMove = useCallback((e: MapMouseEvent) => {
    if (!mapRef.current) return

    const map = mapRef.current.getMap()
    if (!map) return

    const layersToQuery: string[] = []
    if (map.getLayer(LAYER_IDS.clusters)) {
      layersToQuery.push(LAYER_IDS.clusters)
    }
    if (map.getLayer(LAYER_IDS.clusterCount)) {
      layersToQuery.push(LAYER_IDS.clusterCount)
    }
    for (const id of LAYER_IDS.allPoints) {
      if (map.getLayer(id)) layersToQuery.push(id)
    }
    if (map.getLayer('spidered-markers-layer')) {
      layersToQuery.push('spidered-markers-layer')
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
        feature.layer?.id === LAYER_IDS.clusterCount ||
        feature.layer?.id === 'spidered-markers-layer'

      if (isCluster || isMarker) {
        map.getCanvas().style.cursor = 'pointer'
      } else {
        map.getCanvas().style.cursor = ''
      }
    } else {
      map.getCanvas().style.cursor = ''
    }
  }, [])

  return {
    mapRef,
    mapLoaded,
    setMapLoaded,
    selectedTask,
    setSelectedTask,
    taskCount,
    shouldCluster,
    isClusteringForced,
    markersData,
    isLoadingMarkers,
    handleMapClick,
    handleMapMouseMove,
    setCluster,
    clusteredGeoJSONData,
    zoomToAllTags,
    hasAllTagsBounds: allTagsBounds !== null,
    initialViewState,
    spideredMarkers,
    setSpideredMarkers,
  }
}
