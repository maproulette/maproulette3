import { useQuery } from '@tanstack/react-query'
import type maplibregl from 'maplibre-gl'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MapRef, MapMouseEvent } from 'react-map-gl/maplibre'
import type { LayerProps } from 'react-map-gl/maplibre'
import type { GeoJSONSource } from 'maplibre-gl'
import { api } from '@/api'
import { LAYER_IDS, CLUSTER_CONFIG } from '@/components/shared/TaskMarkers/const'
import { createMarkerIcons } from '@/components/shared/TaskMarkers/createMarkerIcons'
import { detectOverlappingTasks } from '@/components/shared/TaskMarkers/overlapUtils'
import type { TaskCluster, TaskMarker } from '@/types/Task'
import { getStyleSpecification } from '@/utils/mapStyles'
import {
    fitMapToBounds,
    getMapBoundsString,
    isWorldBounds,
    parseBoundsString,
} from '@/utils/mapUtils'
import { useExploreChallengesSearchContext } from '../ExploreChallengesSearchContext'
import {
    calculateTaskCount,
    convertTaskMarkersToGeoJSON,
    isValidLocation,
    processMarkersData,
} from './utils'

export const clusterLayer: LayerProps = {
  id: LAYER_IDS.clusters,
  type: 'circle',
  source: LAYER_IDS.source,
  filter: ['has', 'taskCount'],
  paint: {
    'circle-color': [
      'step',
      ['get', 'taskCount'],
      CLUSTER_CONFIG.colors[0],
      CLUSTER_CONFIG.steps[0],
      CLUSTER_CONFIG.colors[1],
      CLUSTER_CONFIG.steps[1],
      CLUSTER_CONFIG.colors[2],
    ],
    'circle-radius': [
      'step',
      ['get', 'taskCount'],
      CLUSTER_CONFIG.sizes[0],
      CLUSTER_CONFIG.steps[0],
      CLUSTER_CONFIG.sizes[1],
      CLUSTER_CONFIG.steps[1],
      CLUSTER_CONFIG.sizes[2],
    ],
    'circle-stroke-width': 0,
    'circle-opacity': 0.9,
  },
}

export const clusterCountLayer: LayerProps = {
  id: LAYER_IDS.clusterCount,
  type: 'symbol',
  source: LAYER_IDS.source,
  filter: ['has', 'taskCount'],
  layout: {
    'text-field': ['to-string', ['get', 'taskCount']],
    'text-font': ['Noto Sans Regular', 'Open Sans Regular', 'Arial Unicode MS Regular'],
    'text-size': 14,
    'text-anchor': 'center',
  },
  paint: {
    'text-color': '#ffffff',
    'text-halo-color': '#000000',
    'text-halo-width': 1,
  },
}

export const unclusteredPointLayer: LayerProps = {
  id: LAYER_IDS.points,
  type: 'symbol',
  source: LAYER_IDS.source,
  filter: ['!', ['has', 'taskCount']],
  layout: {
    'icon-image': [
      'case',
      ['get', 'isOverlapping'],
      // Overlapping markers logic
      [
        'case',
        // Selected overlap marker
        ['get', 'isSelected'],
        [
          'case',
          ['<=', ['get', 'overlapTaskCount'], 20],
          [
            'concat',
            'marker-overlap-',
            ['to-string', ['get', 'overlapTaskCount']],
            '-selected',
          ],
          'marker-overlap-many-selected',
        ],
        // Hovered overlap marker
        ['get', 'isHovered'],
        [
          'case',
          ['<=', ['get', 'overlapTaskCount'], 20],
          [
            'concat',
            'marker-overlap-',
            ['to-string', ['get', 'overlapTaskCount']],
            '-hovered',
          ],
          'marker-overlap-many-hovered',
        ],
        // Normal overlap marker
        [
          'case',
          ['<=', ['get', 'overlapTaskCount'], 20],
          ['concat', 'marker-overlap-', ['to-string', ['get', 'overlapTaskCount']]],
          'marker-overlap-many',
        ],
      ],
      // Regular marker logic
      [
        'case',
        // Selected marker
        ['get', 'isSelected'],
        [
          'concat',
          'marker-pin-',
          ['to-string', ['get', 'status']],
          '-',
          ['to-string', ['coalesce', ['get', 'difficulty'], 1]],
          '-selected',
        ],
        // Hovered marker
        ['get', 'isHovered'],
        [
          'concat',
          'marker-pin-',
          ['to-string', ['get', 'status']],
          '-',
          ['to-string', ['coalesce', ['get', 'difficulty'], 1]],
          '-hovered',
        ],
        // Normal marker
        [
          'concat',
          'marker-pin-',
          ['to-string', ['get', 'status']],
          '-',
          ['to-string', ['coalesce', ['get', 'difficulty'], 1]],
        ],
      ],
    ],
    'icon-size': [
      'case',
      // Highlighted or selected - scale up
      ['any', ['get', 'isHighlighted'], ['get', 'isSelected']],
      1.4,
      // Hovered - scale up slightly
      ['get', 'isHovered'],
      1.2,
      // Overlapping
      ['get', 'isOverlapping'],
      1.0,
      // Normal
      1.0,
    ],
    'icon-anchor': 'bottom',
    'icon-allow-overlap': true,
    'symbol-sort-key': [
      'case',
      ['get', 'isHighlighted'],
      1000,
      ['get', 'isSelected'],
      900,
      ['get', 'isHovered'],
      800,
      0,
    ],
  },
}

export type PopupInfo =
  | { type: 'single'; task: TaskMarker }
  | { type: 'overlap'; tasks: TaskMarker[]; center: [number, number] }
  | null

export const useExploreChallengesMap = () => {
  const { taskMarkerParams, setBounds, cluster, setCluster, bounds } =
    useExploreChallengesSearchContext()
  const mapRef = useRef<MapRef | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [isStylePanelOpen, setIsStylePanelOpen] = useState(false)
  const [popupInfo, setPopupInfo] = useState<PopupInfo>(null)

  const boundsUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const initialBoundsAppliedRef = useRef(false)

  const { data: taskMarkersData, isLoading: isLoadingMarkers } = useQuery(
    api.task.getTaskMarkers(taskMarkerParams)
  )

  const defaultStyle = useMemo(() => {
    const styleSpec = getStyleSpecification('osm-us-vector')
    if (styleSpec) {
      return styleSpec as string | maplibregl.StyleSpecification
    }

    return 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
  }, [])

  const taskCount = useMemo(() => calculateTaskCount(taskMarkersData), [taskMarkersData])

  // Compute whether clustering should be active (temporarily overridden for 500+ tasks)
  const shouldCluster = useMemo(() => {
    // Clustering is temporarily enforced for 500+ tasks, regardless of user preference
    if (taskCount >= 500) {
      return true
    }
    // Otherwise use the user's preference
    return cluster
  }, [taskCount, cluster])

  // Automatically disable clustering when there are less than 100 tasks
  useEffect(() => {
    if (taskCount > 0 && taskCount < 100 && cluster) {
      setCluster(false)
    }
  }, [taskCount, cluster, setCluster])

  const markersData = useMemo(() => processMarkersData(taskMarkersData), [taskMarkersData])

  const geoJSONData = useMemo(() => {
    if (markersData.clusters.length > 0) {
      return convertTaskMarkersToGeoJSON(markersData.clusters as TaskCluster[])
    }
    if (markersData.markers.length > 0) {
      return convertTaskMarkersToGeoJSON(markersData.markers as TaskMarker[])
    }
    return {
      type: 'FeatureCollection',
      features: [],
    } as GeoJSON.FeatureCollection
  }, [markersData])

  const handleMapMoveEnd = useCallback(() => {
    if (!mapRef.current) return

    const map = mapRef.current.getMap()
    if (!map) return

    if (boundsUpdateTimeoutRef.current) {
      clearTimeout(boundsUpdateTimeoutRef.current)
    }

    boundsUpdateTimeoutRef.current = setTimeout(() => {
      const boundsString = getMapBoundsString(map)
      setBounds(boundsString)
    }, 300)
  }, [setBounds])

  // Apply initial bounds
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
          {
            padding: 0,
            duration: 5000,
          }
        )
        initialBoundsAppliedRef.current = true
      }
    } else {
      initialBoundsAppliedRef.current = true
    }
  }, [mapLoaded, bounds])

  // Setup marker icons for clustering
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !shouldCluster) return

    const map = mapRef.current.getMap()
    if (!map) return

    createMarkerIcons({ current: map })

    return () => {
      if (boundsUpdateTimeoutRef.current) {
        clearTimeout(boundsUpdateTimeoutRef.current)
      }
    }
  }, [mapLoaded, shouldCluster])


  const overlapData = useMemo(() => {
    if (shouldCluster) {
      return { overlaps: [], nonOverlapping: [] }
    }

    if (markersData.markers.length === 0) {
      return { overlaps: [], nonOverlapping: [] }
    }

    // Validate markers have valid locations
    const validMarkers = markersData.markers.filter((marker) => isValidLocation(marker.location))

    if (validMarkers.length === 0) {
      return { overlaps: [], nonOverlapping: [] }
    }

    const result = detectOverlappingTasks(validMarkers)

    return result
  }, [shouldCluster, markersData.markers])

  // Close popup if the marker/task is no longer in the data
  useEffect(() => {
    if (!popupInfo) return

    if (popupInfo.type === 'single') {
      // Check if the task still exists in the non-overlapping markers (what's actually rendered)
      const taskExists = overlapData.nonOverlapping.some((m) => m.id === popupInfo.task.id)
      if (!taskExists) {
        setPopupInfo(null)
      }
    } else if (popupInfo.type === 'overlap') {
      // Check if the overlap group still exists
      const overlapExists = overlapData.overlaps.some(
        (o) =>
          o.tasks.length === popupInfo.tasks.length &&
          o.tasks.every((t) => popupInfo.tasks.some((pt) => pt.id === t.id))
      )
      if (!overlapExists) {
        setPopupInfo(null)
      }
    }
  }, [popupInfo, overlapData.nonOverlapping, overlapData.overlaps])

  const handleMapClick = useCallback(
    async (e: MapMouseEvent) => {
      if (shouldCluster && mapRef.current) {
        const feature = e.features?.[0]
        if (!feature) {
          return
        }
        
        const clusterId = feature.properties?.cluster_id
        if (clusterId !== undefined && feature.geometry.type === 'Point') {
          const map = mapRef.current.getMap()
          if (!map) return
          
          const geojsonSource = map.getSource(LAYER_IDS.source) as GeoJSONSource
          if (geojsonSource) {
            try {
              const zoom = await geojsonSource.getClusterExpansionZoom(clusterId)
              const coordinates = feature.geometry.coordinates as [number, number]
              mapRef.current.easeTo({
                center: coordinates,
                zoom,
                duration: 500,
              })
            } catch (error) {
              console.warn('Failed to expand cluster:', error)
            }
          }
        }
      } else {
        setPopupInfo(null)
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
    handleMapMoveEnd,
    handleMapClick,
    setCluster,
    geoJSONData,
  }
}
