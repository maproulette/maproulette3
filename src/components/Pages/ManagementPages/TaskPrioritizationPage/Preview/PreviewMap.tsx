import bbox from '@turf/bbox'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  Layer,
  Map as MapGL,
  type MapMouseEvent,
  type MapRef,
  Source,
  useMap,
} from 'react-map-gl/maplibre'
import Supercluster from 'supercluster'
import { MapControls } from '@/components/Map/MapControls'
import { getCurrentMapStyle } from '@/components/Map/mapStyles'
import { mapBoundsToBbox } from '@/components/Map/mapUtils'
import { ScaleBar } from '@/components/Map/ScaleBar'
import { clusterCountLayer, clusterLayer } from '@/components/Map/TaskMarkers/clusterLayers'
import { flyToClusterExpansion } from '@/components/Map/TaskMarkers/clusterUtils'
import { CLUSTER_RADIUS_PX, LAYER_IDS } from '@/components/Map/TaskMarkers/const'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/utils'
import type { Bbox2D } from '@/types/Map'
import { PRIORITY_COLOR, type TaskPriorityValue } from '@/types/Priority'
import type { TaskMarker } from '@/types/Task'
import { usePrioritizationContext } from '../PrioritizationContext'
import { useTaskPreview } from '../TaskPreviewContext'
import { createPriorityMarkerIcons, PRIORITY_PIN_PREFIX } from './createPriorityMarkerIcons'
import 'maplibre-gl/dist/maplibre-gl.css'

interface PreviewMapRenderCtx {
  map: React.RefObject<MapRef | null>
  mapLoaded: boolean
  cluster: boolean
  setCluster: (next: boolean) => void
}

interface Props {
  externalMapRef?: React.RefObject<MapRef | null>
  onMapLoaded?: (loaded: boolean) => void
  onTaskSelect?: (task: TaskMarker | null) => void
  selectedTaskId?: number | null
  children?: (ctx: PreviewMapRenderCtx) => React.ReactNode
}

const BOUNDS_OUTLINE_COLORS: Record<TaskPriorityValue, string> = {
  0: PRIORITY_COLOR[0].hex,
  1: PRIORITY_COLOR[1].hex,
  2: PRIORITY_COLOR[2].hex,
}

interface ClusterProperties {
  cluster: true
  cluster_id: number
  point_count: number
}

interface PointProperties {
  cluster?: false
  id: number
  priority: TaskPriorityValue
}

export const PreviewMap = ({
  externalMapRef,
  onMapLoaded,
  onTaskSelect,
  selectedTaskId,
  children,
}: Props) => {
  const mapId = useId()
  const idPrefix = useId().replace(/:/g, '-')
  // Shared cluster layers from clusterLayers.ts target source id `LAYER_IDS.source`
  // and define layer ids `LAYER_IDS.clusters` / `LAYER_IDS.clusterCount`; reuse them
  // so the cluster bubble + count styling matches every other map. The unclustered
  // priority pin layer below is preview-specific (priority pins, not status pins).
  const tasksSourceId = LAYER_IDS.source
  const tasksLayerId = `${idPrefix}-tasks-pins`
  const clustersLayerId = LAYER_IDS.clusters
  const clusterCountLayerId = LAYER_IDS.clusterCount
  const localMapRef = useRef<MapRef | null>(null)
  const mapRef = externalMapRef ?? localMapRef
  const [mapLoaded, setMapLoaded] = useState(false)
  const initialFitAppliedRef = useRef(false)
  const { markers, preview } = useTaskPreview()
  const { draft } = usePrioritizationContext()

  const [cluster, setCluster] = useState(true)
  const [mapZoom, setMapZoom] = useState(2)
  const [mapBounds, setMapBounds] = useState<Bbox2D>([-180, -85, 180, 85])
  const superclusterRef = useRef<Supercluster<PointProperties, ClusterProperties> | null>(null)

  useEffect(() => {
    onMapLoaded?.(mapLoaded)
  }, [mapLoaded, onMapLoaded])

  const pointFeatures = useMemo<GeoJSON.Feature<GeoJSON.Point, PointProperties>[]>(() => {
    const features: GeoJSON.Feature<GeoJSON.Point, PointProperties>[] = []
    for (const marker of markers) {
      if (!marker.location) continue
      const computed = (preview.byTaskId.get(marker.id) ?? 1) as TaskPriorityValue
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [marker.location.lng, marker.location.lat],
        },
        properties: {
          cluster: false,
          id: marker.id,
          priority: computed,
        },
      })
    }
    return features
  }, [markers, preview.byTaskId])

  const allPointsFC = useMemo<GeoJSON.FeatureCollection>(
    () => ({ type: 'FeatureCollection', features: pointFeatures }),
    [pointFeatures]
  )

  // Build a single Supercluster index over the point features; toggling the UI
  // off just bypasses the cluster query and renders the raw points instead.
  const superclusterIndex = useMemo(() => {
    if (pointFeatures.length === 0) return null
    const index = new Supercluster<PointProperties, ClusterProperties>({
      radius: CLUSTER_RADIUS_PX,
      maxZoom: 22,
      minZoom: 0,
    })
    index.load(pointFeatures)
    return index
  }, [pointFeatures])

  useEffect(() => {
    superclusterRef.current = superclusterIndex
  }, [superclusterIndex])

  const clusteredFC = useMemo<GeoJSON.FeatureCollection>(() => {
    if (!cluster || !superclusterIndex || pointFeatures.length === 0) {
      return allPointsFC
    }
    const effectiveZoom = mapZoom < 0 ? 0 : Math.floor(mapZoom)
    const clusters = superclusterIndex.getClusters(mapBounds, effectiveZoom)
    return {
      type: 'FeatureCollection',
      features: clusters.map((c) => {
        if (c.properties && 'point_count' in c.properties) {
          const props = c.properties as ClusterProperties
          return {
            type: 'Feature' as const,
            geometry: c.geometry,
            properties: {
              cluster: true,
              cluster_id: props.cluster_id,
              point_count: props.point_count,
            },
          }
        }
        const p = c.properties as PointProperties
        return {
          type: 'Feature' as const,
          geometry: c.geometry,
          properties: { id: p.id, priority: p.priority },
        }
      }),
    }
  }, [cluster, superclusterIndex, mapBounds, mapZoom, allPointsFC, pointFeatures.length])

  const tierBoundsLayers = useMemo(
    () => [
      { priority: 0 as TaskPriorityValue, fc: draft.high.bounds },
      { priority: 1 as TaskPriorityValue, fc: draft.medium.bounds },
      { priority: 2 as TaskPriorityValue, fc: draft.low.bounds },
    ],
    [draft.high.bounds, draft.medium.bounds, draft.low.bounds]
  )

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || initialFitAppliedRef.current) return
    if (allPointsFC.features.length === 0) return
    const map = mapRef.current.getMap()
    if (!map) return
    map.fitBounds(bbox(allPointsFC) as Bbox2D, { padding: 40, duration: 0, maxZoom: 16 })
    initialFitAppliedRef.current = true
  }, [mapLoaded, allPointsFC, mapRef])

  // Track viewport so Supercluster can reproject after pan/zoom.
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return
    const map = mapRef.current.getMap()
    if (!map) return
    const update = () => {
      setMapBounds(mapBoundsToBbox(map.getBounds()))
      setMapZoom(map.getZoom())
    }
    update()
    map.on('move', update)
    map.on('moveend', update)
    return () => {
      map.off('move', update)
      map.off('moveend', update)
    }
  }, [mapLoaded, mapRef])

  const markersById = useMemo(() => {
    const map = new Map<number, TaskMarker>()
    for (const m of markers) map.set(m.id, m)
    return map
  }, [markers])

  const handleClick = useCallback(
    (event: MapMouseEvent) => {
      const feature = event.features?.[0]
      if (!feature) return

      // Cluster click → fly to the expansion zoom returned by Supercluster.
      const clusterId = feature.properties?.cluster_id as number | undefined
      const pointCount = feature.properties?.point_count as number | undefined
      if (clusterId !== undefined && pointCount !== undefined && mapRef.current) {
        const map = mapRef.current.getMap()
        if (feature.geometry.type !== 'Point' || !map) return
        const coordinates = feature.geometry.coordinates as [number, number]
        flyToClusterExpansion(map, superclusterRef.current, clusterId, coordinates)
        return
      }

      if (!onTaskSelect) return
      const rawId = feature.properties?.id
      const id = typeof rawId === 'string' ? Number(rawId) : (rawId as number | undefined)
      if (!id || !Number.isFinite(id)) {
        onTaskSelect(null)
        return
      }
      const marker = markersById.get(id)
      if (marker) onTaskSelect(marker)
    },
    [mapRef, markersById, onTaskSelect]
  )

  const interactiveLayerIds = useMemo(
    () => [tasksLayerId, clustersLayerId, clusterCountLayerId],
    [tasksLayerId, clustersLayerId, clusterCountLayerId]
  )

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return
    const map = mapRef.current.getMap()
    if (!map) return
    const onEnter = () => {
      map.getCanvas().style.cursor = 'pointer'
    }
    const onLeave = () => {
      map.getCanvas().style.cursor = ''
    }
    for (const layerId of interactiveLayerIds) {
      map.on('mouseenter', layerId, onEnter)
      map.on('mouseleave', layerId, onLeave)
    }
    return () => {
      for (const layerId of interactiveLayerIds) {
        map.off('mouseenter', layerId, onEnter)
        map.off('mouseleave', layerId, onLeave)
      }
    }
  }, [mapLoaded, mapRef, interactiveLayerIds])

  return (
    <div
      className={cn(
        'relative h-full w-full overflow-hidden rounded-lg border border-zinc-200 dark:border-slate-700'
      )}
    >
      <MapGL
        id={mapId}
        ref={mapRef}
        initialViewState={{ longitude: 0, latitude: 0, zoom: 1.5 }}
        mapStyle={getCurrentMapStyle()}
        style={{ width: '100%', height: '100%' }}
        onLoad={() => setMapLoaded(true)}
        onClick={handleClick}
        interactiveLayerIds={interactiveLayerIds}
        attributionControl={false}
        dragRotate={false}
        touchPitch={false}
      >
        <PriorityIconLoader />
        <Source id={tasksSourceId} type="geojson" data={clusteredFC}>
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer
            id={tasksLayerId}
            type="symbol"
            layout={{
              'icon-image': [
                'concat',
                `${PRIORITY_PIN_PREFIX}-`,
                ['to-string', ['get', 'priority']],
              ],
              'icon-size': 0.9,
              'icon-anchor': 'bottom',
              'icon-allow-overlap': true,
              'icon-ignore-placement': true,
            }}
            filter={
              selectedTaskId != null
                ? ['all', ['!', ['has', 'point_count']], ['!=', ['get', 'id'], selectedTaskId]]
                : ['!', ['has', 'point_count']]
            }
          />
          {selectedTaskId != null && (
            <Layer
              id={`${tasksLayerId}-selected`}
              type="symbol"
              layout={{
                'icon-image': [
                  'concat',
                  `${PRIORITY_PIN_PREFIX}-`,
                  ['to-string', ['get', 'priority']],
                ],
                'icon-size': 1.4,
                'icon-anchor': 'bottom',
                'icon-allow-overlap': true,
                'icon-ignore-placement': true,
              }}
              filter={['all', ['!', ['has', 'point_count']], ['==', ['get', 'id'], selectedTaskId]]}
            />
          )}
        </Source>
        {tierBoundsLayers.map(({ priority, fc }) =>
          fc && fc.features.length > 0 ? (
            <Source
              key={`bounds-${priority}`}
              id={`${idPrefix}-bounds-${priority}`}
              type="geojson"
              data={fc}
            >
              <Layer
                id={`${idPrefix}-bounds-${priority}-fill`}
                type="fill"
                paint={{
                  'fill-color': BOUNDS_OUTLINE_COLORS[priority],
                  'fill-opacity': 0.08,
                }}
              />
              <Layer
                id={`${idPrefix}-bounds-${priority}-line`}
                type="line"
                paint={{
                  'line-color': BOUNDS_OUTLINE_COLORS[priority],
                  'line-width': 2,
                  'line-dasharray': [2, 2],
                }}
              />
            </Source>
          ) : null
        )}
      </MapGL>

      <MapControls
        map={mapRef}
        mapLoaded={mapLoaded}
        showZoom
        showReset
        showLayers={false}
        collapsible
        defaultOpen
      />

      <div className="pointer-events-none absolute bottom-2 left-2 z-10">
        <ScaleBar mapRef={mapRef} mapLoaded={mapLoaded} />
      </div>

      {preview.isEvaluating && (
        <div
          className="pointer-events-none absolute top-3 right-3 z-10 inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white/95 px-2.5 py-1.5 font-medium text-xs text-zinc-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-200"
          aria-live="polite"
        >
          <Spinner className="size-3.5" />
          Updating preview…
        </div>
      )}

      {children?.({ map: mapRef, mapLoaded, cluster, setCluster })}
    </div>
  )
}

const PriorityIconLoader = () => {
  const { current } = useMap()
  useEffect(() => {
    const map = current?.getMap()
    if (!map) return
    const onStyle = () => createPriorityMarkerIcons(map, () => map.triggerRepaint())
    if (map.isStyleLoaded()) onStyle()
    else map.once('load', onStyle)
  }, [current])
  return null
}
