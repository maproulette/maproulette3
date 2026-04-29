import { Maximize2 } from 'lucide-react'
import type maplibregl from 'maplibre-gl'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { MapMouseEvent, MapRef } from 'react-map-gl/maplibre'
import { Map as MapGL } from 'react-map-gl/maplibre'
import Supercluster from 'supercluster'
import { cn } from '@/lib/utils'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapControls } from '@/components/Map/MapControls'
import { MapStyleSwitcher } from '@/components/Map/MapStyleSwitcher'
import { getStyleSpecification } from '@/components/Map/mapStyles'
import { fitMapToBounds } from '@/components/Map/mapUtils'
import { ClusterSource } from '@/components/Map/TaskMarkers/ClusterSource'
import { ClusterToggle } from '@/components/Map/TaskMarkers/ClusterToggle'
import { LAYER_IDS } from '@/components/Map/TaskMarkers/const'
import { createMarkerIcons } from '@/components/Map/TaskMarkers/createMarkerIcons'
import { SpiderMarkers } from '@/components/Map/TaskMarkers/SpiderMarkers'
import { createSpiderGroup, detectVisualOverlaps } from '@/components/Map/TaskMarkers/spiderUtils'
import { convertTaskMarkersToGeoJSON } from '@/components/Map/TaskMarkers/utils'
import { MapLoadingIndicator } from '@/components/shared/MapLoadingIndicator'
import { useDrawerPortal } from '@/components/TaskInfoPanel/DrawerPortalContext'
import { TaskInfoDrawer } from '@/components/TaskInfoPanel/TaskInfoDrawer'
import type { TaskMarker } from '@/types/Task'

interface MiniChallengeMapProps {
  markers: TaskMarker[]
  isLoading: boolean
  containerClassName?: string
  onBoundsStringChange?: (bounds: string) => void
  selectedTask?: TaskMarker | null
  onSelectTask?: (task: TaskMarker | null) => void
}

interface PointProperties {
  cluster?: false
  id: number
  status: number
  priority: number
  isSelected?: boolean
}

interface ClusterProperties {
  cluster: true
  cluster_id: number
  point_count: number
  point_count_abbreviated: string
}

const BOUNDS_DEBOUNCE_MS = 400

export const MiniChallengeMap = ({
  markers,
  isLoading,
  containerClassName = 'h-52 w-full',
  onBoundsStringChange,
  selectedTask = null,
  onSelectTask,
}: MiniChallengeMapProps) => {
  const mapId = useId()
  const mapRef = useRef<MapRef | null>(null)
  const boundsDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const superclusterRef = useRef<Supercluster<PointProperties, ClusterProperties> | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [isStylePanelOpen, setIsStylePanelOpen] = useState(false)
  const [cluster, setCluster] = useState(true)
  const [mapZoom, setMapZoom] = useState(2)
  const [mapBounds, setMapBounds] = useState<[number, number, number, number]>([-180, -85, 180, 85])
  const [iconsVersion, setIconsVersion] = useState(0)
  // Use internal state only if no external control is provided
  const [internalSelectedTask, setInternalSelectedTask] = useState<TaskMarker | null>(null)
  const activeSelectedTask = onSelectTask ? selectedTask : internalSelectedTask
  const setSelectedTask = onSelectTask ?? setInternalSelectedTask
  const [spideredMarkers, setSpideredMarkers] = useState<
    Map<number, { original: [number, number]; spidered: [number, number] }>
  >(new Map())
  const initialBoundsAppliedRef = useRef(false)
  const { portalTarget } = useDrawerPortal()

  // Reason: converts marker data to GeoJSON format - avoids rebuilding feature collection on every render
  const geoJSONData = useMemo(() => {
    if (markers.length > 0) {
      return convertTaskMarkersToGeoJSON(markers)
    }
    return { type: 'FeatureCollection', features: [] } as GeoJSON.FeatureCollection
  }, [markers])

  const pointFeatures = useMemo(() => {
    return geoJSONData.features
      .filter((f): f is GeoJSON.Feature<GeoJSON.Point> => f.geometry.type === 'Point')
      .map((feature) => {
        return {
          type: 'Feature' as const,
          geometry: feature.geometry,
          properties: {
            cluster: false as const,
            id: feature.properties?.id as number,
            status: feature.properties?.status as number,
            priority: feature.properties?.priority as number,
            isSelected: (feature.properties?.id as number) === activeSelectedTask?.id,
          },
        }
      })
  }, [geoJSONData, activeSelectedTask?.id])

  // Track map viewport
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return
    const map = mapRef.current.getMap()
    if (!map) return

    const updateViewport = () => {
      setMapZoom(Math.floor(map.getZoom()))
      const bounds = map.getBounds()
      if (bounds) {
        setMapBounds([bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()])
      }
    }
    updateViewport()
    map.on('move', updateViewport)
    map.on('moveend', updateViewport)
    return () => {
      map.off('move', updateViewport)
      map.off('moveend', updateViewport)
    }
  }, [mapLoaded])

  // Reason: builds Supercluster spatial indices - expensive initialization should only run when features change
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
  // Reason: selects the active Supercluster index based on cluster toggle state
  const superclusterIndex = useMemo(() => {
    const idx = cluster || isClusteringForced ? clusteredIndex : unclusteredIndex
    superclusterRef.current = idx
    return idx
  }, [clusteredIndex, unclusteredIndex, cluster, isClusteringForced])

  // Reason: queries Supercluster for visible clusters/points in current viewport - avoids requery on every render
  const clusteredGeoJSONData = useMemo((): GeoJSON.FeatureCollection => {
    if (!superclusterIndex) return { type: 'FeatureCollection', features: [] }
    const effectiveZoom = mapZoom < 2 ? 0 : mapZoom
    const clusters = superclusterIndex.getClusters(mapBounds, effectiveZoom)

    const features = clusters
      .filter((c) => {
        if ('cluster_id' in c.properties && 'point_count' in c.properties) return true
        return !spideredMarkers.has((c.properties as PointProperties).id)
      })
      .map((c) => {
        const isCluster = 'cluster_id' in c.properties && 'point_count' in c.properties
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
        const pp = c.properties as PointProperties
        return {
          type: 'Feature' as const,
          geometry: c.geometry,
          properties: {
            id: pp.id,
            status: pp.status,
            priority: pp.priority,
            isSelected: pp.isSelected,
          },
        }
      })

    return { type: 'FeatureCollection', features }
  }, [superclusterIndex, mapBounds, mapZoom, iconsVersion, spideredMarkers])

  // Reason: resolves map style specification once - avoids redundant lookups on every render
  const defaultStyle = useMemo(() => {
    const spec = getStyleSpecification('osm-us-vector')
    return spec
      ? (spec as string | maplibregl.StyleSpecification)
      : 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
  }, [])

  // Create marker icons
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return
    const map = mapRef.current.getMap()
    if (!map) return
    createMarkerIcons({ current: map }, () => {
      map.triggerRepaint()
      setIconsVersion((v) => v + 1)
    })
  }, [mapLoaded, cluster])

  // Reason: computes bounding box from all task coordinates - avoids iterating features on every render
  const allTagsBounds = useMemo(() => {
    if (!geoJSONData || geoJSONData.features.length === 0) return null
    const coords: [number, number][] = []
    for (const f of geoJSONData.features) {
      if (f.geometry.type === 'Point') {
        coords.push(f.geometry.coordinates as [number, number])
      }
    }
    if (coords.length === 0) return null
    const lngs = coords.map((c) => c[0])
    const lats = coords.map((c) => c[1])
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

  // Reason: stable reference for debounced bounds reporter used as map moveend handler
  const scheduleBoundsReport = useCallback(() => {
    if (!onBoundsStringChange) return
    if (boundsDebounceRef.current) clearTimeout(boundsDebounceRef.current)
    boundsDebounceRef.current = setTimeout(() => {
      boundsDebounceRef.current = null
      const map = mapRef.current?.getMap()
      if (!map) return
      const b = map.getBounds()
      onBoundsStringChange(`${b.getWest()},${b.getSouth()},${b.getEast()},${b.getNorth()}`)
    }, BOUNDS_DEBOUNCE_MS)
  }, [onBoundsStringChange])

  useEffect(() => {
    return () => {
      if (boundsDebounceRef.current) clearTimeout(boundsDebounceRef.current)
    }
  }, [])

  // Fit to task bounds on initial load
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || initialBoundsAppliedRef.current) return
    if (isLoading) return
    const map = mapRef.current.getMap()
    if (!map) return

    if (allTagsBounds) {
      fitMapToBounds(map, allTagsBounds, { padding: 50, duration: 0 })
    }
    initialBoundsAppliedRef.current = true
    scheduleBoundsReport()
  }, [mapLoaded, allTagsBounds, isLoading, scheduleBoundsReport])

  // Reason: stable reference for zoom-to-all button click handler
  const zoomToAllTags = useCallback(() => {
    if (!mapRef.current || !allTagsBounds) return
    const map = mapRef.current.getMap()
    if (!map) return
    fitMapToBounds(map, allTagsBounds, { padding: 50, duration: 1000 })
  }, [allTagsBounds])

  // Reason: stable reference for map click handler - avoids re-bindng event listener on every render
  const handleMapClick = useCallback(
    (e: MapMouseEvent) => {
      if (!e.features || e.features.length === 0) {
        setSpideredMarkers(new Map())
        setSelectedTask(null)
        return
      }
      const feature = e.features[0]
      if (!feature || !mapRef.current) return
      const map = mapRef.current.getMap()
      if (!map) return

      // Spidered marker click
      if (feature.layer?.id === 'spidered-markers-layer' && feature.properties?.id !== undefined) {
        const taskId = feature.properties.id as number
        const task = markers.find((m) => m.id === taskId)
        if (task) setSelectedTask(task)
        return
      }

      // Cluster click -> zoom in
      const isClusterFeature =
        feature.properties?.cluster_id !== undefined ||
        feature.properties?.point_count !== undefined
      if (isClusterFeature && feature.geometry.type === 'Point') {
        const coords = feature.geometry.coordinates as [number, number]
        const clusterId = feature.properties.cluster_id
        if (clusterId !== undefined && superclusterRef.current) {
          try {
            const zoom = superclusterRef.current.getClusterExpansionZoom(clusterId)
            mapRef.current.jumpTo({
              center: coords,
              zoom: Math.min(zoom, map.getMaxZoom()),
            })
          } catch {
            mapRef.current.jumpTo({
              center: coords,
              zoom: Math.min(map.getZoom() + 2, map.getMaxZoom()),
            })
          }
        }
        setSpideredMarkers(new Map())
        return
      }

      // Unclustered point click -> detect overlaps and spider, or select task
      const isUnclusteredPoint =
        feature.layer?.id === LAYER_IDS.points &&
        feature.properties?.id !== undefined &&
        feature.geometry.type === 'Point'
      if (isUnclusteredPoint) {
        const overlaps = detectVisualOverlaps(map, e.point, LAYER_IDS.points, 15)
        if (overlaps.length > 1) {
          const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat]
          setSpideredMarkers(createSpiderGroup(overlaps, coords, map))
          setSelectedTask(null)
          return
        }
        // Single marker - show task info drawer
        const taskId = feature.properties?.id as number
        const task = markers.find((m) => m.id === taskId)
        if (task) {
          setSpideredMarkers(new Map())
          setSelectedTask(task)
        }
      }
    },
    [markers]
  )

  // Reason: stable reference for mouse move handler - avoids re-binding event listener on every render
  const handleMapMouseMove = useCallback((e: MapMouseEvent) => {
    if (!mapRef.current) return
    const map = mapRef.current.getMap()
    if (!map) return

    const layers: string[] = []
    if (map.getLayer(LAYER_IDS.clusters)) layers.push(LAYER_IDS.clusters)
    if (map.getLayer(LAYER_IDS.clusterCount)) layers.push(LAYER_IDS.clusterCount)
    if (map.getLayer(LAYER_IDS.points)) layers.push(LAYER_IDS.points)
    if (map.getLayer('spidered-markers-layer')) layers.push('spidered-markers-layer')

    if (layers.length === 0) {
      map.getCanvas().style.cursor = ''
      return
    }
    const features = map.queryRenderedFeatures(e.point, { layers })
    map.getCanvas().style.cursor = features && features.length > 0 ? 'pointer' : ''
  }, [])

  const shouldCluster = cluster

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border border-zinc-200 dark:border-slate-700',
        containerClassName
      )}
    >
      <div className="absolute inset-0">
        <MapGL
          id={mapId}
          ref={mapRef}
          initialViewState={{ longitude: 0, latitude: 0, zoom: 1.5 }}
          mapStyle={defaultStyle}
          style={{ width: '100%', height: '100%' }}
          onLoad={() => setMapLoaded(true)}
          onMoveEnd={onBoundsStringChange ? scheduleBoundsReport : undefined}
          onClick={handleMapClick}
          onMouseMove={handleMapMouseMove}
          attributionControl={false}
          dragRotate={false}
          touchPitch={false}
          interactiveLayerIds={
            shouldCluster
              ? [
                  LAYER_IDS.clusters,
                  LAYER_IDS.clusterCount,
                  LAYER_IDS.points,
                  'spidered-markers-layer',
                ]
              : [LAYER_IDS.points, 'spidered-markers-layer']
          }
        >
          <ClusterSource clusteredData={clusteredGeoJSONData} />

          {spideredMarkers.size > 0 && (
            <SpiderMarkers
              markers={markers.filter((m) => spideredMarkers.has(m.id))}
              spiderPositions={spideredMarkers}
              selectedTaskId={activeSelectedTask?.id}
            />
          )}
        </MapGL>
      </div>

      <MapLoadingIndicator isLoading={isLoading} />

      <MapControls
        map={mapRef}
        mapLoaded={mapLoaded}
        showZoom={true}
        showReset={true}
        showLayers={true}
        collapsible={true}
        defaultOpen={true}
        onLayersClick={() => setIsStylePanelOpen(!isStylePanelOpen)}
        StyleSwitcherPanel={MapStyleSwitcher}
        styleSwitcherPanelProps={{
          map: mapRef,
          mapLoaded,
          isOpen: isStylePanelOpen,
          onClose: () => setIsStylePanelOpen(false),
        }}
        customButtons={
          allTagsBounds
            ? [
                {
                  icon: Maximize2,
                  onClick: zoomToAllTags,
                  tooltip: 'Zoom to all tasks',
                  disabled: !mapLoaded,
                },
              ]
            : []
        }
      />

      <ClusterToggle clusteringEnabled={shouldCluster} onToggle={setCluster} />

      {portalTarget &&
        createPortal(
          <TaskInfoDrawer
            selectedTask={activeSelectedTask}
            onClose={() => {
              setSelectedTask(null)
              setSpideredMarkers(new Map())
            }}
            mapRef={mapRef}
          />,
          portalTarget
        )}
    </div>
  )
}
