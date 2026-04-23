import type maplibregl from 'maplibre-gl'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Layer, Map as MapGL, type MapRef, Source } from 'react-map-gl/maplibre'
import { MapControls } from '@/components/Map/MapControls'
import { getStyleSpecification } from '@/components/Map/mapStyles'
import { calculateBoundingBox, fitMapToBounds } from '@/components/Map/mapUtils'
import { cn } from '@/lib/utils'
import { PRIORITY_COLOR, type TaskPriorityValue } from '@/types/Priority'
import { usePrioritizationContext } from '../PrioritizationContext'
import { useTaskPreview } from '../TaskPreviewContext'
import 'maplibre-gl/dist/maplibre-gl.css'

interface Props {
  /** When true, only tasks whose computed priority differs from the server's value are rendered. */
  showOnlyChanged: boolean
  /** Optional parent-owned map ref — allows siblings (bounds editors) to attach to the same map. */
  externalMapRef?: React.RefObject<MapRef | null>
  /** Called when the map finishes loading; parent uses this to know when terra-draw can attach. */
  onMapLoaded?: (loaded: boolean) => void
  /** Optional overlay children (legend, badges, etc.). */
  children?: (ctx: { map: React.RefObject<MapRef | null>; mapLoaded: boolean }) => React.ReactNode
}

const BOUNDS_OUTLINE_COLORS: Record<TaskPriorityValue, string> = {
  0: PRIORITY_COLOR[0].hex,
  1: PRIORITY_COLOR[1].hex,
  2: PRIORITY_COLOR[2].hex,
}

export const PreviewMap = ({ showOnlyChanged, externalMapRef, onMapLoaded, children }: Props) => {
  const mapId = useId()
  const idPrefix = useId().replace(/:/g, '-')
  const tasksSourceId = `${idPrefix}-tasks`
  const tasksLayerId = `${idPrefix}-tasks-circles`
  const localMapRef = useRef<MapRef | null>(null)
  const mapRef = externalMapRef ?? localMapRef
  const [mapLoaded, setMapLoaded] = useState(false)
  const initialFitAppliedRef = useRef(false)
  const { markers } = useTaskPreview()
  const { preview } = useTaskPreview()
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

  // Point features, colored by computed priority.
  const pointFeatures = useMemo<GeoJSON.FeatureCollection>(() => {
    const features: GeoJSON.Feature[] = []
    for (const marker of markers) {
      if (!marker.location) continue
      const computed = preview.byTaskId.get(marker.id) ?? 1
      if (showOnlyChanged && computed === marker.priority) continue
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [marker.location.lng, marker.location.lat],
        },
        properties: {
          id: marker.id,
          priority: computed,
          color: PRIORITY_COLOR[computed].hex,
          current: marker.priority,
          changed: computed !== marker.priority ? 1 : 0,
        },
      })
    }
    return { type: 'FeatureCollection', features }
  }, [markers, preview.byTaskId, showOnlyChanged])

  // Tier bounds as one feature collection per tier (for outline coloring).
  const tierBoundsLayers = useMemo(
    () => [
      { priority: 0 as TaskPriorityValue, fc: draft.high.bounds },
      { priority: 1 as TaskPriorityValue, fc: draft.medium.bounds },
      { priority: 2 as TaskPriorityValue, fc: draft.low.bounds },
    ],
    [draft.high.bounds, draft.medium.bounds, draft.low.bounds]
  )

  // Initial fit to task extent.
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || initialFitAppliedRef.current) return
    if (pointFeatures.features.length === 0) return
    const map = mapRef.current.getMap()
    if (!map) return
    const bbox = calculateBoundingBox(pointFeatures)
    if (bbox) {
      fitMapToBounds(map, bbox, { padding: 40, duration: 0 })
      initialFitAppliedRef.current = true
    }
  }, [mapLoaded, pointFeatures, mapRef])

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
        attributionControl={false}
        dragRotate={false}
        touchPitch={false}
      >
        <Source id={tasksSourceId} type="geojson" data={pointFeatures}>
          <Layer
            id={tasksLayerId}
            type="circle"
            paint={{
              'circle-radius': 5,
              'circle-color': ['get', 'color'],
              'circle-stroke-color': '#ffffff',
              'circle-stroke-width': 1,
              'circle-opacity': 0.9,
            }}
          />
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

      {children?.({ map: mapRef, mapLoaded })}
    </div>
  )
}
