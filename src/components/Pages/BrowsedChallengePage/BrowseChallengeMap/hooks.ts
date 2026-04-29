import { useNavigate, useSearch } from '@tanstack/react-router'
import type maplibregl from 'maplibre-gl'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MapMouseEvent, MapRef } from 'react-map-gl/maplibre'
import Supercluster from 'supercluster'
import { api } from '@/api'
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
import {
  calculateTaskCount,
  convertTaskMarkersToGeoJSON,
  processMarkersData,
} from '@/components/Map/TaskMarkers/utils'
import type { TaskMarker } from '@/types/Task'
import { useBrowsedChallengeContext } from '../contexts/BrowsedChallengeContext'

// Module-level constant — no useMemo needed since it never changes
const DEFAULT_STYLE: string | maplibregl.StyleSpecification =
  (getStyleSpecification('osm-us-vector') as string | maplibregl.StyleSpecification) ??
  'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'

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
  const { bounds: initialBounds } = useSearch({ from: '/_app/challenge/$challengeId/' })
  const navigate = useNavigate()
  const mapRef = useRef<MapRef | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [isStylePanelOpen, setIsStylePanelOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<TaskMarker | null>(null)
  const [cluster, setCluster] = useState<boolean>(true)
  const [spideredMarkers, setSpideredMarkers] = useState<
    Map<number, { original: [number, number]; spidered: [number, number] }>
  >(new Map())
  const initialBoundsAppliedRef = useRef(false)

  const [initialViewState] = useState(() => {
    if (initialBounds && !isWorldBounds(initialBounds)) {
      const parsed = parseBoundsString(initialBounds)
      if (parsed) {
        const [west, south, east, north] = parsed
        return {
          bounds: [
            [west, south],
            [east, north],
          ] as [[number, number], [number, number]],
          fitBoundsOptions: { padding: 0 },
        }
      }
    }
    return { longitude: 0, latitude: 0, zoom: 0 }
  })

  const boundsUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastAppliedBoundsRef = useRef<string | null>(null)
  const superclusterRef = useRef<Supercluster<PointProperties, ClusterProperties> | null>(null)
  const [mapZoom, setMapZoom] = useState(2)
  const [mapBounds, setMapBounds] = useState<[number, number, number, number]>([-180, -85, 180, 85])
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

  // Reason: Supercluster index building (expensive computation)
  const { clusteredIndex, unclusteredIndex } = useMemo(() => {
    if (pointFeatures.length === 0) {
      return { clusteredIndex: null, unclusteredIndex: null }
    }

    const clusterOptions = {
      maxZoom: 16,
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

  const defaultStyle = DEFAULT_STYLE

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
  const allTagsBounds = useMemo(() => {
    if (!geoJSONData || geoJSONData.features.length === 0) return null

    const coordinates: [number, number][] = []

    geoJSONData.features.forEach((feature) => {
      if (feature.geometry.type === 'Point') {
        const [lng, lat] = feature.geometry.coordinates
        coordinates.push([lng, lat])
      }
    })

    if (coordinates.length === 0) return null

    const lngs = coordinates.map((c) => c[0])
    const lats = coordinates.map((c) => c[1])
    const west = Math.min(...lngs)
    const east = Math.max(...lngs)
    const south = Math.min(...lats)
    const north = Math.max(...lats)

    if (west === east && south === north) return null

    return [
      [west, south],
      [east, north],
    ] as [[number, number], [number, number]]
  }, [geoJSONData])

  // Reason: Passed to map component that would re-render without stable reference
  const handleMapMoveEnd = useCallback(() => {
    // Don't update URL until initial bounds have been applied
    if (!initialBoundsAppliedRef.current) return
    if (!mapRef.current) return

    const map = mapRef.current.getMap()
    if (!map) return

    if (boundsUpdateTimeoutRef.current) {
      clearTimeout(boundsUpdateTimeoutRef.current)
    }

    boundsUpdateTimeoutRef.current = setTimeout(() => {
      const boundsString = getMapBoundsString(map)

      if (
        !lastAppliedBoundsRef.current ||
        !boundsAreEqual(boundsString, lastAppliedBoundsRef.current)
      ) {
        navigate({
          to: '/challenge/$challengeId',
          params: { challengeId: String(challenge.id) },
          search: (prev) => ({
            ...prev,
            bounds: boundsString && !isWorldBounds(boundsString) ? boundsString : undefined,
          }),
          replace: true,
        })
        lastAppliedBoundsRef.current = boundsString
      }
    }, 300)
  }, [challenge.id, navigate])

  // Load initial bounds from URL or fit to all tags
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || initialBoundsAppliedRef.current) return

    const map = mapRef.current.getMap()
    if (!map) return

    // If we have valid URL bounds, use those
    if (initialBounds && !isWorldBounds(initialBounds)) {
      const parsedBounds = parseBoundsString(initialBounds)
      if (parsedBounds) {
        const [west, south, east, north] = parsedBounds
        fitMapToBounds(
          map,
          [
            [west, south],
            [east, north],
          ],
          {
            padding: 0,
            duration: 1000,
          }
        )
        lastAppliedBoundsRef.current = initialBounds
        initialBoundsAppliedRef.current = true
        return
      }
    }

    // If task markers are still loading, wait for them
    if (isLoadingMarkers) return

    // Fit to task bounds if available
    if (allTagsBounds) {
      fitMapToBounds(map, allTagsBounds, {
        padding: 50,
        duration: 1000,
      })
      initialBoundsAppliedRef.current = true
    } else {
      // No bounds available and loading is complete - mark as applied so we don't retry
      initialBoundsAppliedRef.current = true
    }
  }, [mapLoaded, initialBounds, allTagsBounds, isLoadingMarkers, mapRef])

  // Reason: Stable reference needed — passed as onClick handler to map controls
  const zoomToAllTags = useCallback(() => {
    if (!mapRef.current || !allTagsBounds) return

    const map = mapRef.current.getMap()
    if (!map) return

    fitMapToBounds(map, allTagsBounds, {
      padding: 50,
      duration: 1000,
    })
  }, [allTagsBounds])

  // Reason: Passed to map component that would re-render without stable reference
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
        const clusterId = feature.properties.cluster_id

        if (clusterId !== undefined && superclusterRef.current) {
          try {
            const zoom = superclusterRef.current.getClusterExpansionZoom(clusterId)
            mapRef.current.flyTo({
              center: coordinates,
              zoom: Math.min(zoom, map.getMaxZoom()),
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
        // Check for visual overlaps at click point
        const clickPoint = e.point
        const visuallyOverlappingMarkers = detectVisualOverlaps(
          map,
          clickPoint,
          LAYER_IDS.points,
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
      setSpideredMarkers(new Map())
      setSelectedTask(null)
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
    if (map.getLayer(LAYER_IDS.points)) {
      layersToQuery.push(LAYER_IDS.points)
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
        feature.layer?.id === LAYER_IDS.points ||
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

  useEffect(() => {
    return () => {
      if (boundsUpdateTimeoutRef.current) {
        clearTimeout(boundsUpdateTimeoutRef.current)
      }
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
    handleMapClick,
    handleMapMouseMove,
    handleMapMoveEnd,
    setCluster,
    clusteredGeoJSONData,
    zoomToAllTags,
    hasAllTagsBounds: allTagsBounds !== null,
    initialViewState,
    spideredMarkers,
    setSpideredMarkers,
  }
}
