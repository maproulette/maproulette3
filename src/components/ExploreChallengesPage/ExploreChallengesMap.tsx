import { useQuery } from '@tanstack/react-query'
import type maplibregl from 'maplibre-gl'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MapRef } from 'react-map-gl/maplibre'
import {
    FullscreenControl,
    GeolocateControl,
    Map as MapGL,
    Marker,
    NavigationControl,
    Popup,
    ScaleControl,
} from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Layers } from 'lucide-react'
import { api } from '@/api'
import { OverlapPopup, SingleTaskPopup } from '@/components/OverlapedMarkersPopup'
import { MapStyleSwitcher } from '@/components/shared/MapStyleSwitcher'
import { addMapLayers } from '@/components/shared/TaskMarkers/addMapLayers'
import { ClusterToggle } from '@/components/shared/TaskMarkers/ClusterToggle'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import { createMarkerIcons } from '@/components/shared/TaskMarkers/createMarkerIcons'
import {
    handleClusterClick,
    setupEventListeners,
} from '@/components/shared/TaskMarkers/eventListeners'
import { detectOverlappingTasks } from '@/components/shared/TaskMarkers/overlapUtils'
import { Button } from '@/components/ui/Button'
import type { TaskCluster, TaskMarker } from '@/types/Task'
import { getStyleSpecification } from '@/utils/mapStyles'
import {
    fitMapToBounds,
    getMapBoundsString,
    isWorldBounds,
    parseBoundsString,
} from '@/utils/mapUtils'
import { useExploreChallengesSearchContext } from './ExploreChallengesSearchContext'
import { OverlapTaskPin } from './OverlapTaskPin'
import { TaskPin } from './TaskPin'

const convertTaskMarkersToGeoJSON = (
  markers: TaskMarker[] | TaskCluster[]
): GeoJSON.FeatureCollection => {
  const features: GeoJSON.Feature[] = markers
    .map((marker): GeoJSON.Feature | null => {
      let location: { lng: number; lat: number } | null = null
      let id: number
      let status: number
      let priority: number

      if ('location' in marker && marker.location) {
        location = {
          lng: marker.location.lng,
          lat: marker.location.lat,
        }
        id = marker.id
        status = marker.status
        priority = marker.priority
      } else if ('point' in marker && marker.point) {
        location = {
          lng: marker.point.lng,
          lat: marker.point.lat,
        }
        id = marker.clusterId
        status = marker.taskStatus ?? 0
        priority = 0
      } else {
        return null
      }

      if (!location) {
        return null
      }

      const properties: Record<string, unknown> = {
        id,
        status,
        priority,
        difficulty: 1,
      }

      if ('numberOfPoints' in marker) {
        const pointCount = marker.numberOfPoints
        properties.point_count = pointCount
        properties.taskCount = pointCount
        properties.cluster = true
      } else {
        properties.cluster = false
        properties.isOverlapping = false
        properties.isSelected = false
        properties.isHovered = false
        properties.isHighlighted = false
      }

      return {
        type: 'Feature',
        properties,
        geometry: {
          type: 'Point',
          coordinates: [location.lng, location.lat],
        },
      } as GeoJSON.Feature
    })
    .filter((f): f is GeoJSON.Feature => f !== null)

  return {
    type: 'FeatureCollection',
    features,
  }
}

export const ExploreChallengesMap = () => {
  const { taskMarkerParams, setBounds, cluster, setCluster, bounds } =
    useExploreChallengesSearchContext()
  const mapRef = useRef<MapRef | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [isStylePanelOpen, setIsStylePanelOpen] = useState(false)
  const [popupInfo, setPopupInfo] = useState<
    | { type: 'single'; task: TaskMarker }
    | { type: 'overlap'; tasks: TaskMarker[]; center: [number, number] }
    | null
  >(null)

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

  const taskCount = useMemo(() => {
    if (!taskMarkersData) return 0

    if ('totalCount' in taskMarkersData && typeof taskMarkersData.totalCount === 'number') {
      return taskMarkersData.totalCount
    }

    const markers = Array.isArray(taskMarkersData)
      ? taskMarkersData
      : 'tasks' in taskMarkersData && Array.isArray(taskMarkersData.tasks)
        ? taskMarkersData.tasks
        : 'markers' in taskMarkersData && Array.isArray(taskMarkersData.markers)
          ? taskMarkersData.markers
          : 'clusters' in taskMarkersData && Array.isArray(taskMarkersData.clusters)
            ? taskMarkersData.clusters
            : []

    if (markers.length > 0 && 'numberOfPoints' in markers[0]) {
      return markers.reduce(
        (sum, marker) => sum + ('numberOfPoints' in marker ? marker.numberOfPoints : 0),
        0
      )
    }

    return markers.length
  }, [taskMarkersData])

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

  const markersData = useMemo(() => {
    if (!taskMarkersData) {
      return { markers: [], clusters: [] }
    }

    const allData = Array.isArray(taskMarkersData)
      ? taskMarkersData
      : 'tasks' in taskMarkersData && Array.isArray(taskMarkersData.tasks)
        ? taskMarkersData.tasks
        : 'markers' in taskMarkersData && Array.isArray(taskMarkersData.markers)
          ? taskMarkersData.markers
          : 'clusters' in taskMarkersData && Array.isArray(taskMarkersData.clusters)
            ? taskMarkersData.clusters
            : []

    const markers: TaskMarker[] = []
    const clusters: TaskCluster[] = []

    allData.forEach((item) => {
      if ('numberOfPoints' in item || 'taskCount' in item) {
        clusters.push(item as TaskCluster)
      } else if ('location' in item) {
        markers.push(item as TaskMarker)
      }
    })

    return { markers, clusters }
  }, [taskMarkersData])

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

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !shouldCluster) return

    const map = mapRef.current.getMap()
    if (!map) return

    createMarkerIcons({ current: map })

    const sourceId = LAYER_IDS.source
    const existingSource = map.getSource(sourceId)

    const useClientSideClustering = false

    if (existingSource && existingSource.type === 'geojson') {

      ;(existingSource as maplibregl.GeoJSONSource).setData(geoJSONData)
    } else {
      map.addSource(sourceId, {
        type: 'geojson',
        data: geoJSONData,
        cluster: useClientSideClustering,
        clusterMaxZoom: 14,
        clusterRadius: 120,
      })
    }

    addMapLayers({ current: map }, { useTaskCountFilter: true })

    const cleanup = setupEventListeners({ current: map })

    return () => {
      cleanup()
      if (boundsUpdateTimeoutRef.current) {
        clearTimeout(boundsUpdateTimeoutRef.current)
      }
    }
  }, [mapLoaded, geoJSONData, shouldCluster])

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || shouldCluster) return

    const map = mapRef.current.getMap()
    if (!map) return

    try {
      if (map.getLayer(LAYER_IDS.clusters)) map.removeLayer(LAYER_IDS.clusters)
      if (map.getLayer(LAYER_IDS.clusterCount)) map.removeLayer(LAYER_IDS.clusterCount)
      if (map.getLayer(LAYER_IDS.points)) map.removeLayer(LAYER_IDS.points)
      const highlightLayerId = `${LAYER_IDS.points}-highlight`
      if (map.getLayer(highlightLayerId)) map.removeLayer(highlightLayerId)
      const sourceId = LAYER_IDS.source
      if (map.getSource(sourceId)) map.removeSource(sourceId)
    } catch (error) {
      // Error removing clustering layers
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
    const validMarkers = markersData.markers.filter((marker) => {
      const isValid =
        marker.location != null &&
        typeof marker.location.lng === 'number' &&
        typeof marker.location.lat === 'number' &&
        !isNaN(marker.location.lng) &&
        !isNaN(marker.location.lat) &&
        isFinite(marker.location.lng) &&
        isFinite(marker.location.lat)

      return isValid
    })

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


  const markerPins = useMemo(() => {
    if (shouldCluster) {
      return null
    }

    if (markersData.markers.length === 0) {
      return null
    }

    // Only render non-overlapping markers
    const validMarkers = overlapData.nonOverlapping.filter((marker) => {
      const isValid =
        marker.location != null &&
        typeof marker.location.lng === 'number' &&
        typeof marker.location.lat === 'number' &&
        !isNaN(marker.location.lng) &&
        !isNaN(marker.location.lat) &&
        isFinite(marker.location.lng) &&
        isFinite(marker.location.lat)

      return isValid
    })

    const singlePins = validMarkers.map((marker) => (
      <Marker
        key={`marker-${marker.id}`}
        longitude={marker.location.lng}
        latitude={marker.location.lat}
        anchor="bottom"
        onClick={(e) => {
          e.originalEvent.stopPropagation()
          setPopupInfo({ type: 'single', task: marker })
        }}
      >
        <TaskPin status={marker.status} priority={marker.priority} difficulty={1} />
      </Marker>
    ))

    // Create overlap pins from overlap groups
    const overlapPins = overlapData.overlaps
      .filter((overlap) => {
        const isValid =
          overlap.center != null &&
          Array.isArray(overlap.center) &&
          overlap.center.length === 2 &&
          typeof overlap.center[0] === 'number' &&
          typeof overlap.center[1] === 'number' &&
          !isNaN(overlap.center[0]) &&
          !isNaN(overlap.center[1]) &&
          isFinite(overlap.center[0]) &&
          isFinite(overlap.center[1]) &&
          overlap.tasks != null &&
          overlap.tasks.length > 0

        return isValid
      })
      .map((overlap) => (
        <Marker
          key={`overlap-${overlap.id}`}
          longitude={overlap.center[0]}
          latitude={overlap.center[1]}
          anchor="bottom"
          onClick={(e) => {
            e.originalEvent.stopPropagation()
            setPopupInfo({ type: 'overlap', tasks: overlap.tasks, center: overlap.center })
          }}
        >
          <OverlapTaskPin tasks={overlap.tasks} />
        </Marker>
      ))

    return [...singlePins, ...overlapPins]
  }, [shouldCluster, overlapData.nonOverlapping, overlapData.overlaps, markersData.markers.length])

  return (
    <div className="relative h-full w-full">
      <MapGL
        ref={mapRef}
        initialViewState={{
          longitude: 0,
          latitude: 0,
          zoom: 2,
        }}
        mapStyle={defaultStyle}
        onLoad={() => setMapLoaded(true)}
        onMoveEnd={handleMapMoveEnd}
        onClick={(e) => {
          if (shouldCluster && mapRef.current) {
            const map = mapRef.current.getMap()
            if (map) {
              handleClusterClick({ current: map }, e as maplibregl.MapMouseEvent)
            }
          } else {
            setPopupInfo(null)
          }
        }}
      >
        <GeolocateControl position="top-left" />
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" />
        <ScaleControl position="bottom-left" />

        {markerPins}

        {popupInfo && popupInfo.type === 'single' && popupInfo.task.location && (
          <Popup
            key={`single-${popupInfo.task.id}`}
            anchor="top"
            longitude={Number(popupInfo.task.location.lng)}
            latitude={Number(popupInfo.task.location.lat)}
            onClose={() => {
              setPopupInfo(null)
            }}
            closeButton={true}
            closeOnClick={true}
          >
            <SingleTaskPopup task={popupInfo.task} />
          </Popup>
        )}

        {popupInfo && popupInfo.type === 'overlap' && (
          <Popup
            key={`overlap-${popupInfo.tasks.map((t) => t.id).join('-')}`}
            anchor="top"
            longitude={popupInfo.center[0]}
            latitude={popupInfo.center[1]}
            onClose={() => {
              setPopupInfo(null)
            }}
            closeButton={true}
            closeOnClick={true}
          >
            <OverlapPopup tasks={popupInfo.tasks} />
          </Popup>
        )}
      </MapGL>
      {isLoadingMarkers && (
        <div className="absolute top-4 left-4 z-10 rounded bg-white/90 px-3 py-2 text-sm shadow-md dark:bg-zinc-900/90">
          Loading task markers...
        </div>
      )}
      {/* Style Switcher Button */}
      <div className="absolute top-20 right-4 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsStylePanelOpen(!isStylePanelOpen)}
          disabled={!mapLoaded}
          className="h-10 w-10 bg-white shadow-md hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          <Layers className="h-4 w-4" />
        </Button>
      </div>
      <MapStyleSwitcher
        map={mapRef}
        mapLoaded={mapLoaded}
        isOpen={isStylePanelOpen}
        onClose={() => setIsStylePanelOpen(false)}
      />
      <ClusterToggle
        clusteringEnabled={shouldCluster}
        onToggle={setCluster}
        taskCount={taskCount}
        showWarnings={true}
      />
    </div>
  )
}
