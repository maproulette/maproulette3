import bbox from '@turf/bbox'
import type maplibregl from 'maplibre-gl'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  Layer,
  Map as MapGL,
  type MapMouseEvent,
  type MapRef,
  Source,
  useMap,
} from 'react-map-gl/maplibre'
import { MapControls } from '@/components/Map/MapControls'
import { getStyleSpecification } from '@/components/Map/mapStyles'
import { ScaleBar } from '@/components/Map/ScaleBar'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/utils'
import type { Bbox2D } from '@/types/Map'
import { PRIORITY_COLOR, type TaskPriorityValue } from '@/types/Priority'
import type { TaskMarker } from '@/types/Task'
import { usePrioritizationContext } from '../PrioritizationContext'
import { useTaskPreview } from '../TaskPreviewContext'
import { createPriorityMarkerIcons, PRIORITY_PIN_PREFIX } from './createPriorityMarkerIcons'
import 'maplibre-gl/dist/maplibre-gl.css'

interface Props {
  externalMapRef?: React.RefObject<MapRef | null>
  onMapLoaded?: (loaded: boolean) => void
  onTaskSelect?: (task: TaskMarker | null) => void
  selectedTaskId?: number | null
  children?: (ctx: { map: React.RefObject<MapRef | null>; mapLoaded: boolean }) => React.ReactNode
}

const BOUNDS_OUTLINE_COLORS: Record<TaskPriorityValue, string> = {
  0: PRIORITY_COLOR[0].hex,
  1: PRIORITY_COLOR[1].hex,
  2: PRIORITY_COLOR[2].hex,
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
  const tasksSourceId = `${idPrefix}-tasks`
  const tasksLayerId = `${idPrefix}-tasks-pins`
  const localMapRef = useRef<MapRef | null>(null)
  const mapRef = externalMapRef ?? localMapRef
  const [mapLoaded, setMapLoaded] = useState(false)
  const initialFitAppliedRef = useRef(false)
  const { markers, preview } = useTaskPreview()
  const { draft } = usePrioritizationContext()

  useEffect(() => {
    onMapLoaded?.(mapLoaded)
  }, [mapLoaded, onMapLoaded])

  const defaultStyle = useMemo(() => {
    const spec = getStyleSpecification('osm-us-vector')
    return spec
      ? (spec as string | maplibregl.StyleSpecification)
      : 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
  }, [])

  const pointFeatures = useMemo<GeoJSON.FeatureCollection>(() => {
    const features: GeoJSON.Feature[] = []
    for (const marker of markers) {
      if (!marker.location) continue
      const computed = preview.byTaskId.get(marker.id) ?? 1
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [marker.location.lng, marker.location.lat],
        },
        properties: {
          id: marker.id,
          priority: computed,
        },
      })
    }
    return { type: 'FeatureCollection', features }
  }, [markers, preview.byTaskId])

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
    if (pointFeatures.features.length === 0) return
    const map = mapRef.current.getMap()
    if (!map) return
    map.fitBounds(bbox(pointFeatures) as Bbox2D, { padding: 40, duration: 0, maxZoom: 16 })
    initialFitAppliedRef.current = true
  }, [mapLoaded, pointFeatures, mapRef])

  const markersById = useMemo(() => {
    const map = new Map<number, TaskMarker>()
    for (const m of markers) map.set(m.id, m)
    return map
  }, [markers])

  const handleClick = (event: MapMouseEvent) => {
    if (!onTaskSelect) return
    const feature = event.features?.[0]
    const rawId = feature?.properties?.id
    const id = typeof rawId === 'string' ? Number(rawId) : (rawId as number | undefined)
    if (!id || !Number.isFinite(id)) {
      onTaskSelect(null)
      return
    }
    const marker = markersById.get(id)
    if (marker) onTaskSelect(marker)
  }

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
    map.on('mouseenter', tasksLayerId, onEnter)
    map.on('mouseleave', tasksLayerId, onLeave)
    return () => {
      map.off('mouseenter', tasksLayerId, onEnter)
      map.off('mouseleave', tasksLayerId, onLeave)
    }
  }, [mapLoaded, mapRef, tasksLayerId])

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
        mapStyle={defaultStyle}
        style={{ width: '100%', height: '100%' }}
        onLoad={() => setMapLoaded(true)}
        onClick={handleClick}
        interactiveLayerIds={[tasksLayerId]}
        attributionControl={false}
        dragRotate={false}
        touchPitch={false}
      >
        <PriorityIconLoader />
        <Source id={tasksSourceId} type="geojson" data={pointFeatures}>
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
              selectedTaskId != null ? ['!=', ['get', 'id'], selectedTaskId] : ['literal', true]
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
              filter={['==', ['get', 'id'], selectedTaskId]}
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

      {children?.({ map: mapRef, mapLoaded })}
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
