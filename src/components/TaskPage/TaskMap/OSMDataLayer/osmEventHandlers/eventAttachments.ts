import type maplibregl from 'maplibre-gl'
import { createMapClickHandler } from './clickHandler'
import { createMouseMoveHandler } from './hoverHandlers'
import type { EventHandlerContext } from './types'

export const attachEventHandlers = (
  map: maplibregl.Map,
  context: EventHandlerContext,
  eventHandlerTimeoutRef: React.MutableRefObject<number | null>,
  mapClickHandlerRef: React.MutableRefObject<((e: maplibregl.MapMouseEvent) => void) | null>,
  mapMouseMoveHandlerRef: React.MutableRefObject<((e: maplibregl.MapMouseEvent) => void) | null>
): void => {
  if (eventHandlerTimeoutRef.current !== null) {
    clearTimeout(eventHandlerTimeoutRef.current)
  }

  eventHandlerTimeoutRef.current = window.setTimeout(() => {
    if (!map) return

    const interactiveLayers = context.layersRef.current.filter(
      (id) => !id.includes('-highlight') && map.getLayer(id)
    )

    if (mapClickHandlerRef.current) {
      map.off('click', mapClickHandlerRef.current)
    }
    if (mapMouseMoveHandlerRef.current) {
      map.off('mousemove', mapMouseMoveHandlerRef.current)
    }

    const handleMapClick = createMapClickHandler(context)
    mapClickHandlerRef.current = handleMapClick
    map.on('click', handleMapClick)

    const handleMouseMove = createMouseMoveHandler(context)
    mapMouseMoveHandlerRef.current = handleMouseMove
    map.on('mousemove', handleMouseMove)

    const mapInstance = map as maplibregl.Map & {
      off(event: string, layerId: string): void
      on(event: string, layerId: string, handler: (e: maplibregl.MapLayerMouseEvent) => void): void
    }

    interactiveLayers.forEach((layerId) => {
      try {
        mapInstance.off('mouseenter', layerId)
        mapInstance.off('mouseleave', layerId)
        mapInstance.on('mouseenter', layerId, () => {
          if (!context.currentPopupRef.current) {
            map.getCanvas().style.cursor = 'pointer'
          }
        })
        mapInstance.on('mouseleave', layerId, () => {})
      } catch {}
    })

    eventHandlerTimeoutRef.current = null
  }, 100)
}

export const removeEventHandlers = (
  map: maplibregl.Map,
  context: EventHandlerContext,
  mapClickHandlerRef: React.MutableRefObject<((e: maplibregl.MapMouseEvent) => void) | null>,
  mapMouseMoveHandlerRef: React.MutableRefObject<((e: maplibregl.MapMouseEvent) => void) | null>
): void => {
  if (mapClickHandlerRef.current) {
    try {
      map.off('click', mapClickHandlerRef.current)
      mapClickHandlerRef.current = null
    } catch {}
  }

  if (mapMouseMoveHandlerRef.current) {
    try {
      map.off('mousemove', mapMouseMoveHandlerRef.current)
      mapMouseMoveHandlerRef.current = null
    } catch {}
  }

  const interactiveLayers = context.layersRef.current.filter((id) => !id.includes('-highlight'))
  const mapInstance = map as maplibregl.Map & {
    off(event: string, layerId: string): void
  }

  interactiveLayers.forEach((layerId) => {
    try {
      mapInstance.off('mouseenter', layerId)
      mapInstance.off('mouseleave', layerId)
    } catch {}
  })
}
