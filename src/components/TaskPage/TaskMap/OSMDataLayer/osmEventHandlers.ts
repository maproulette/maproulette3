import type maplibregl from 'maplibre-gl'
import { Popup } from 'maplibre-gl'
import { createPopupContent } from './osmPopup'

interface EventHandlerContext {
  map: React.RefObject<maplibregl.Map | null>
  sourceId: string
  layersRef: React.MutableRefObject<string[]>
  currentPopupRef: React.MutableRefObject<maplibregl.Popup | null>
  highlightedFeatureIdsRef: React.MutableRefObject<Set<string>>
  hoveredFeatureIdRef: React.MutableRefObject<string | null>
}

/**
 * Gets feature ID from a feature (handles both top-level id and properties.id)
 */
const getFeatureId = (feature: GeoJSON.Feature): string | undefined => {
  return feature.id !== undefined
    ? String(feature.id)
    : feature.properties?.id !== undefined
      ? String(feature.properties.id)
      : undefined
}

/**
 * Checks if a feature is a valid OSM feature
 */
const isValidOSMFeature = (feature: GeoJSON.Feature): boolean => {
  const type = feature.properties?.type
  return type === 'way' || type === 'area' || type === 'node'
}

/**
 * Creates map-level click handler that queries for OSM features
 */
export const createMapClickHandler = (context: EventHandlerContext) => {
  const {
    map,
    sourceId,
    layersRef,
    currentPopupRef,
    highlightedFeatureIdsRef,
    hoveredFeatureIdRef,
  } = context

  return (e: maplibregl.MapMouseEvent) => {
    if (!map.current) return

    // Clear hover state
    if (hoveredFeatureIdRef.current) {
      try {
        map.current.setFeatureState(
          { source: sourceId, id: hoveredFeatureIdRef.current },
          { hover: false }
        )
      } catch {
        // Ignore errors
      }
      hoveredFeatureIdRef.current = null
    }

    // Query for OSM features at the click point
    const osmLayerIds = layersRef.current.filter((id) => !id.includes('-highlight'))
    const osmFeatures =
      osmLayerIds.length > 0
        ? map.current.queryRenderedFeatures(e.point, {
            layers: osmLayerIds,
          })
        : []

    // Filter to only valid OSM features and deduplicate by feature ID
    const validOSMFeatures = osmFeatures.filter(isValidOSMFeature)
    const uniqueFeatures = new Map<string, GeoJSON.Feature>()
    validOSMFeatures.forEach((feature) => {
      const featureId = getFeatureId(feature)
      if (featureId && !uniqueFeatures.has(featureId)) {
        uniqueFeatures.set(featureId, feature)
      }
    })
    const deduplicatedFeatures = Array.from(uniqueFeatures.values())

    if (deduplicatedFeatures.length > 0) {
      // Get IDs of clicked features
      const clickedFeatureIds = new Set<string>()
      deduplicatedFeatures.forEach((feature) => {
        const featureId = getFeatureId(feature)
        if (featureId) {
          clickedFeatureIds.add(featureId)
        }
      })

      // Check if we're clicking on the same features (all clicked IDs are already highlighted)
      const isSameSelection =
        clickedFeatureIds.size > 0 &&
        clickedFeatureIds.size === highlightedFeatureIdsRef.current.size &&
        Array.from(clickedFeatureIds).every((id) => highlightedFeatureIdsRef.current.has(id))

      if (isSameSelection && currentPopupRef.current) {
        // Clicking on the same features - just close the popup and clear highlights
        currentPopupRef.current.remove()
        currentPopupRef.current = null

        // Clear highlights
        highlightedFeatureIdsRef.current.forEach((featureId) => {
          try {
            map.current?.setFeatureState(
              { source: sourceId, id: featureId },
              { hover: false, selected: false }
            )
          } catch {
            // Ignore errors
          }
        })
        highlightedFeatureIdsRef.current.clear()
        return
      }

      // Different selection - clear previous highlights first
      highlightedFeatureIdsRef.current.forEach((featureId) => {
        // Only clear if not in the new selection
        if (!clickedFeatureIds.has(featureId)) {
          try {
            map.current?.setFeatureState(
              { source: sourceId, id: featureId },
              { hover: false, selected: false }
            )
          } catch {
            // Ignore errors
          }
        }
      })

      // Close existing popup (remove close handler first to prevent clearing highlights)
      if (currentPopupRef.current) {
        // Remove all event listeners to prevent the close handler from running
        currentPopupRef.current.remove()
        currentPopupRef.current = null
      }

      // Highlight all clicked features (including ones that were already highlighted)
      clickedFeatureIds.forEach((featureId) => {
        if (map.current) {
          try {
            map.current.setFeatureState(
              { source: sourceId, id: featureId },
              { hover: true, selected: true }
            )
          } catch {
            // Ignore errors
          }
        }
      })
      highlightedFeatureIdsRef.current = clickedFeatureIds

      // Create and show popup with all features
      const popupContent = createPopupContent(deduplicatedFeatures)
      currentPopupRef.current = new Popup({
        closeOnClick: true,
        closeButton: true,
        maxWidth: '400px',
      })
        .setLngLat(e.lngLat)
        .setDOMContent(popupContent)
        .addTo(map.current)

      // Remove highlights when popup closes
      currentPopupRef.current.on('close', () => {
        highlightedFeatureIdsRef.current.forEach((featureId) => {
          try {
            map.current?.setFeatureState(
              { source: sourceId, id: featureId },
              { hover: false, selected: false }
            )
          } catch {
            // Ignore errors
          }
        })
        highlightedFeatureIdsRef.current.clear()
        currentPopupRef.current = null
      })
      return
    }

    // No OSM feature clicked - check if we clicked on a task marker
    const style = map.current.getStyle()
    const taskMarkerLayerIds =
      style?.layers
        ?.filter(
          (layer) =>
            layer.id.includes('task-unclustered-point') ||
            layer.id.includes('task-markers-points') ||
            layer.id.includes('task-clusters')
        )
        .map((layer) => layer.id) || []

    if (taskMarkerLayerIds.length > 0) {
      const taskMarkerFeatures = map.current.queryRenderedFeatures(e.point, {
        layers: taskMarkerLayerIds,
      })
      if (taskMarkerFeatures && taskMarkerFeatures.length > 0) {
        return // Let task marker handler deal with it
      }
    }

    // Clicked on empty space - clear everything
    highlightedFeatureIdsRef.current.forEach((featureId) => {
      try {
        map.current?.setFeatureState(
          { source: sourceId, id: featureId },
          { hover: false, selected: false }
        )
      } catch {
        // Ignore errors
      }
    })
    highlightedFeatureIdsRef.current.clear()

    if (currentPopupRef.current) {
      currentPopupRef.current.remove()
      currentPopupRef.current = null
    }
  }
}

/**
 * Creates mouseenter handler for hover highlight
 */
export const createMouseEnterHandler = (context: EventHandlerContext) => {
  const { map, sourceId, currentPopupRef, hoveredFeatureIdRef, highlightedFeatureIdsRef } = context

  return (e: maplibregl.MapLayerMouseEvent) => {
    if (!e.features || e.features.length === 0 || !map.current) return

    const feature = e.features[0]
    if (!isValidOSMFeature(feature)) return

    const featureId = getFeatureId(feature)
    if (!featureId) return

    // If popup is open and this feature is already selected, don't change hover state
    if (currentPopupRef.current && highlightedFeatureIdsRef.current.has(featureId)) {
      return
    }

    // If popup is open but this is a different feature, don't hover
    if (currentPopupRef.current) {
      return
    }

    hoveredFeatureIdRef.current = featureId
    try {
      map.current.setFeatureState({ source: sourceId, id: featureId }, { hover: true })
    } catch {
      hoveredFeatureIdRef.current = null
    }
  }
}

/**
 * Creates mouseleave handler to remove hover highlight
 */
export const createMouseLeaveHandler = (context: EventHandlerContext) => {
  const { map, sourceId, currentPopupRef, hoveredFeatureIdRef, highlightedFeatureIdsRef } = context

  return () => {
    if (!map.current) return

    // Don't clear hover if popup is open and this feature is selected
    if (currentPopupRef.current && hoveredFeatureIdRef.current) {
      const featureId = hoveredFeatureIdRef.current
      // If this feature is in the highlighted set (selected), keep it highlighted
      if (highlightedFeatureIdsRef.current.has(featureId)) {
        return
      }
    }

    // Don't clear hover if popup is open (for any other features)
    if (currentPopupRef.current) {
      return
    }

    if (hoveredFeatureIdRef.current) {
      try {
        map.current.setFeatureState(
          { source: sourceId, id: hoveredFeatureIdRef.current },
          { hover: false }
        )
      } catch {
        // Ignore errors
      }
      hoveredFeatureIdRef.current = null
    }
  }
}

/**
 * Attaches event handlers to OSM layers
 */
export const attachEventHandlers = (
  map: maplibregl.Map,
  context: EventHandlerContext,
  eventHandlerTimeoutRef: React.MutableRefObject<number | null>,
  mapClickHandlerRef: React.MutableRefObject<((e: maplibregl.MapMouseEvent) => void) | null>
): void => {
  if (eventHandlerTimeoutRef.current !== null) {
    clearTimeout(eventHandlerTimeoutRef.current)
  }

  // Wait for layers to be fully added
  eventHandlerTimeoutRef.current = window.setTimeout(() => {
    if (!map) return

    const interactiveLayers = context.layersRef.current.filter(
      (id) => !id.includes('-highlight') && map.getLayer(id)
    )

    // Remove existing map click handler
    if (mapClickHandlerRef.current) {
      map.off('click', mapClickHandlerRef.current)
    }

    // Attach map-level click handler
    const handleMapClick = createMapClickHandler(context)
    mapClickHandlerRef.current = handleMapClick
    map.on('click', handleMapClick)

    const handleMouseEnter = createMouseEnterHandler(context)
    const handleMouseLeave = createMouseLeaveHandler(context)

    // Attach hover handlers to layers
    const mapInstance = map as maplibregl.Map & {
      off(event: string, layerId: string): void
      on(event: string, layerId: string, handler: (e: maplibregl.MapLayerMouseEvent) => void): void
    }

    interactiveLayers.forEach((layerId) => {
      try {
        mapInstance.off('mouseenter', layerId)
        mapInstance.off('mouseleave', layerId)
        mapInstance.on('mouseenter', layerId, (e) => {
          map.getCanvas().style.cursor = 'pointer'
          handleMouseEnter(e)
        })
        mapInstance.on('mouseleave', layerId, () => {
          map.getCanvas().style.cursor = ''
          handleMouseLeave()
        })
      } catch {
        // Ignore errors
      }
    })

    eventHandlerTimeoutRef.current = null
  }, 100)
}

/**
 * Removes event handlers from OSM layers
 */
export const removeEventHandlers = (
  map: maplibregl.Map,
  context: EventHandlerContext,
  mapClickHandlerRef: React.MutableRefObject<((e: maplibregl.MapMouseEvent) => void) | null>
): void => {
  if (mapClickHandlerRef.current) {
    try {
      map.off('click', mapClickHandlerRef.current)
      mapClickHandlerRef.current = null
    } catch {
      // Ignore errors
    }
  }

  const interactiveLayers = context.layersRef.current.filter((id) => !id.includes('-highlight'))
  const mapInstance = map as maplibregl.Map & {
    off(event: string, layerId: string): void
  }

  interactiveLayers.forEach((layerId) => {
    try {
      mapInstance.off('mouseenter', layerId)
      mapInstance.off('mouseleave', layerId)
    } catch {
      // Ignore errors
    }
  })
}
