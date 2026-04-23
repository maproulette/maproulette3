import { Eraser, Pencil, Square } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { MapRef } from 'react-map-gl/maplibre'
import {
  type GeoJSONStoreFeatures,
  type HexColor,
  TerraDraw,
  TerraDrawPolygonMode,
  TerraDrawRectangleMode,
  TerraDrawSelectMode,
} from 'terra-draw'
import { TerraDrawMapLibreGLAdapter } from 'terra-draw-maplibre-gl-adapter'
import { Button } from '@/components/ui/Button'
import { logger } from '@/lib/logger'
import { cn } from '@/lib/utils'
import { PRIORITY_COLOR, type TaskPriorityValue } from '@/types/Priority'
import { TIER_TO_PRIORITY, type Tier } from '../PrioritizationContext'

interface Props {
  tier: Tier
  map: React.RefObject<MapRef | null>
  mapLoaded: boolean
  value: GeoJSON.FeatureCollection | null
  onChange: (next: GeoJSON.FeatureCollection | null) => void
  className?: string
}

type DrawMode = 'select' | 'polygon' | 'rectangle'

const featureToFC = (
  features: GeoJSON.Feature[] | null | undefined
): GeoJSON.FeatureCollection | null => {
  if (!features || features.length === 0) return null
  return { type: 'FeatureCollection', features }
}

const isPolygonish = (f: GeoJSON.Feature) =>
  f.geometry?.type === 'Polygon' || f.geometry?.type === 'MultiPolygon'

/**
 * Tier-scoped polygon/rectangle editor backed by terra-draw. Mounts on top of
 * the shared PreviewMap instance.
 */
export const BoundsDrawControl = ({ tier, map, mapLoaded, value, onChange, className }: Props) => {
  const drawRef = useRef<TerraDraw | null>(null)
  const suppressChangeRef = useRef(false)
  const [activeMode, setActiveMode] = useState<DrawMode>('select')
  const priority: TaskPriorityValue = TIER_TO_PRIORITY[tier]
  const color = PRIORITY_COLOR[priority].hex as HexColor

  // Initialize / teardown terra-draw instance tied to the map lifetime.
  useEffect(() => {
    if (!mapLoaded || !map.current) return
    const mapInstance = map.current.getMap()
    if (!mapInstance) return
    let draw: TerraDraw | null = null
    try {
      draw = new TerraDraw({
        adapter: new TerraDrawMapLibreGLAdapter({
          map: mapInstance,
          prefixId: `td-bounds-${tier}`,
        }),
        modes: [
          new TerraDrawSelectMode({
            flags: {
              polygon: { feature: { draggable: true } },
              rectangle: { feature: { draggable: true } },
            },
          }),
          new TerraDrawPolygonMode({
            styles: {
              fillColor: color,
              outlineColor: color,
              fillOpacity: 0.15,
              outlineWidth: 2,
            },
          }),
          new TerraDrawRectangleMode({
            styles: {
              fillColor: color,
              outlineColor: color,
              fillOpacity: 0.15,
              outlineWidth: 2,
            },
          }),
        ],
      })
      draw.start()
      draw.setMode('select')
    } catch (error) {
      logger.error('Failed to initialize terra-draw for bounds editor', { error, tier })
      return
    }
    drawRef.current = draw

    // Seed with existing polygons (if any), flagging to suppress the echo change event.
    if (value?.features?.length) {
      try {
        suppressChangeRef.current = true
        draw.addFeatures(value.features.filter(isPolygonish) as unknown as GeoJSONStoreFeatures[])
      } catch (error) {
        logger.warn('Could not seed bounds features', { error, tier })
      } finally {
        suppressChangeRef.current = false
      }
    }

    const handleChange = () => {
      if (!drawRef.current || suppressChangeRef.current) return
      const snap = drawRef.current.getSnapshot()
      const features = snap.filter(isPolygonish) as GeoJSON.Feature[]
      onChange(featureToFC(features))
    }
    draw.on('change', handleChange)
    draw.on('finish', handleChange)

    return () => {
      try {
        draw?.stop()
      } catch (error) {
        logger.warn('Error stopping terra-draw', { error, tier })
      }
      drawRef.current = null
    }
    // Only re-init on map lifecycle changes; value seeding handled separately.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLoaded, map, tier, color])

  const setMode = (mode: DrawMode) => {
    setActiveMode(mode)
    drawRef.current?.setMode(mode)
  }

  const clearAll = () => {
    if (!drawRef.current) return
    try {
      suppressChangeRef.current = true
      const snap = drawRef.current.getSnapshot()
      drawRef.current.removeFeatures(snap.map((f) => f.id).filter((id) => id !== undefined))
    } catch (error) {
      logger.warn('Could not clear bounds', { error, tier })
    } finally {
      suppressChangeRef.current = false
    }
    onChange(null)
  }

  return (
    <div
      className={cn(
        'inline-flex flex-wrap items-center gap-1 rounded-md border border-zinc-200 bg-white/95 p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900/95',
        className
      )}
    >
      <Button
        type="button"
        size="sm"
        variant={activeMode === 'polygon' ? 'default' : 'ghost'}
        onClick={() => setMode('polygon')}
        aria-label={`Draw polygon for ${tier} priority`}
      >
        <Pencil className="size-3.5" />
        Polygon
      </Button>
      <Button
        type="button"
        size="sm"
        variant={activeMode === 'rectangle' ? 'default' : 'ghost'}
        onClick={() => setMode('rectangle')}
        aria-label={`Draw rectangle for ${tier} priority`}
      >
        <Square className="size-3.5" />
        Rectangle
      </Button>
      <Button
        type="button"
        size="sm"
        variant={activeMode === 'select' ? 'default' : 'ghost'}
        onClick={() => setMode('select')}
      >
        Select
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={clearAll}
        disabled={!value || !value.features?.length}
      >
        <Eraser className="size-3.5" />
        Clear
      </Button>
    </div>
  )
}
