import type maplibregl from 'maplibre-gl'
import { Popup } from 'maplibre-gl'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import {
  handleClusterClick,
  handleMarkerClick,
} from '@/components/shared/TaskMarkers/eventListeners'
import { createPopupContent } from './osmPopup'

interface EventHandlerContext {
  map: React.RefObject<maplibregl.Map | null>
  sourceId: string
  layersRef: React.MutableRefObject<string[]>
  currentPopupRef: React.MutableRefObject<maplibregl.Popup | null>
  highlightedFeatureIdsRef: React.MutableRefObject<Set<string>>
  hoveredFeatureIdsRef: React.MutableRefObject<Set<string>>
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
    hoveredFeatureIdsRef,
  } = context

  return (e: maplibregl.MapMouseEvent) => {
    if (!map.current) return

    // Clear all hover states
    hoveredFeatureIdsRef.current.forEach((featureId) => {
      try {
        map.current?.setFeatureState({ source: sourceId, id: featureId }, { hover: false })
      } catch {
        // Ignore errors
      }
    })
    hoveredFeatureIdsRef.current.clear()

    // Check for task markers FIRST - they should have priority
    // This ensures task marker clicks work even when OSM features are present
    // Use exact layer IDs from LAYER_IDS constant
    const taskMarkerLayerIds = [
      LAYER_IDS.points,
      LAYER_IDS.clusters,
      LAYER_IDS.clusterCount,
    ].filter((id) => {
      const layer = map.current?.getLayer(id)
      if (!layer) return false
      const layout = layer.layout as { visibility?: string } | undefined
      return layout?.visibility !== 'none'
    })

    if (taskMarkerLayerIds.length > 0) {
      const taskMarkerFeatures = map.current.queryRenderedFeatures(e.point, {
        layers: taskMarkerLayerIds,
      })
      if (taskMarkerFeatures && taskMarkerFeatures.length > 0) {
        // Verify the click is actually on a task marker feature
        const clickedFeature = taskMarkerFeatures[0]
        const layerId = clickedFeature.layer?.id

        // For clusters, verify the click is actually on the cluster (not just nearby)
        if (layerId === LAYER_IDS.clusters || layerId?.includes('cluster')) {
          // Verify it's actually a cluster feature
          const clusterFeature = taskMarkerFeatures.find(
            (f) => f.layer?.id === LAYER_IDS.clusters || f.layer?.id?.includes('task-clusters')
          )
          if (clusterFeature) {
            handleClusterClick(map, e, LAYER_IDS.source)
          }
          // Don't process OSM features even if cluster click didn't happen
          return
        } else {
          // For point markers, handle the click
          handleMarkerClick(map, e, LAYER_IDS.source)
        }
        // Don't process OSM features
        return
      }
    }

    // Query for OSM features at the click point (only if no task marker was clicked)
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

    // No OSM feature clicked - clicked on empty space, clear everything
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
  const { map, sourceId, currentPopupRef, hoveredFeatureIdsRef, highlightedFeatureIdsRef } = context

  return (e: maplibregl.MapLayerMouseEvent) => {
    if (!e.features || e.features.length === 0 || !map.current) return

    // If popup is open, don't change hover state
    if (currentPopupRef.current) {
      return
    }

    // Get all valid OSM features from the event
    const validFeatures = e.features.filter(isValidOSMFeature)
    const newHoveredIds = new Set<string>()

    validFeatures.forEach((feature) => {
      const featureId = getFeatureId(feature)
      if (!featureId) return

      // Skip if already selected (popup is open)
      if (highlightedFeatureIdsRef.current.has(featureId)) {
        return
      }

      newHoveredIds.add(featureId)
    })

    // Clear hover state for features that are no longer hovered
    hoveredFeatureIdsRef.current.forEach((featureId) => {
      if (!newHoveredIds.has(featureId)) {
        try {
          if (map.current) {
            map.current.setFeatureState({ source: sourceId, id: featureId }, { hover: false })
          }
        } catch {
          // Ignore errors
        }
      }
    })

    // Set hover state for newly hovered features
    newHoveredIds.forEach((featureId) => {
      if (!hoveredFeatureIdsRef.current.has(featureId)) {
        try {
          if (map.current) {
            map.current.setFeatureState({ source: sourceId, id: featureId }, { hover: true })
          }
        } catch {
          // Ignore errors
        }
      }
    })

    hoveredFeatureIdsRef.current = newHoveredIds
  }
}

/**
 * Creates mouseleave handler to remove hover highlight
 */
export const createMouseLeaveHandler = (context: EventHandlerContext) => {
  const { map, sourceId, currentPopupRef, hoveredFeatureIdsRef, highlightedFeatureIdsRef } = context

  return () => {
    if (!map.current) return

    // Don't clear hover if popup is open
    if (currentPopupRef.current) {
      return
    }

    // Clear all hover states
    hoveredFeatureIdsRef.current.forEach((featureId) => {
      // Don't clear if it's selected (shouldn't happen, but safety check)
      if (highlightedFeatureIdsRef.current.has(featureId)) {
        return
      }

      try {
        if (map.current) {
          map.current.setFeatureState({ source: sourceId, id: featureId }, { hover: false })
        }
      } catch {
        // Ignore errors
      }
    })
    hoveredFeatureIdsRef.current.clear()
  }
}

/**
 * Creates mousemove handler to track hover state accurately
 */
const createMouseMoveHandler = (context: EventHandlerContext) => {
  const {
    map,
    sourceId,
    layersRef,
    currentPopupRef,
    hoveredFeatureIdsRef,
    highlightedFeatureIdsRef,
  } = context

  return (e: maplibregl.MapMouseEvent) => {
    if (!map.current || currentPopupRef.current) {
      // Update cursor when popup is open
      if (map.current) {
        map.current.getCanvas().style.cursor = ''
      }
      return
    }

    const osmLayerIds = layersRef.current.filter((id) => !id.includes('-highlight'))
    if (osmLayerIds.length === 0) {
      map.current.getCanvas().style.cursor = ''
      return
    }

    // Query for OSM features at the cursor position
    const osmFeatures = map.current.queryRenderedFeatures(e.point, {
      layers: osmLayerIds,
    })

    const validOSMFeatures = osmFeatures.filter(isValidOSMFeature)
    const currentlyHoveredIds = new Set<string>()

    validOSMFeatures.forEach((feature) => {
      const featureId = getFeatureId(feature)
      if (featureId && !highlightedFeatureIdsRef.current.has(featureId)) {
        currentlyHoveredIds.add(featureId)
      }
    })

    // Update cursor style
    if (currentlyHoveredIds.size > 0) {
      map.current.getCanvas().style.cursor = 'pointer'
    } else {
      map.current.getCanvas().style.cursor = ''
    }

    // Clear hover for features no longer under cursor
    hoveredFeatureIdsRef.current.forEach((featureId) => {
      if (!currentlyHoveredIds.has(featureId)) {
        try {
          map.current?.setFeatureState({ source: sourceId, id: featureId }, { hover: false })
        } catch {
          // Ignore errors
        }
      }
    })

    // Set hover for newly hovered features
    currentlyHoveredIds.forEach((featureId) => {
      if (!hoveredFeatureIdsRef.current.has(featureId)) {
        try {
          map.current?.setFeatureState({ source: sourceId, id: featureId }, { hover: true })
        } catch {
          // Ignore errors
        }
      }
    })

    hoveredFeatureIdsRef.current = currentlyHoveredIds
  }
}

/**
 * Attaches event handlers to OSM layers
 */
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

  // Wait for layers to be fully added
  eventHandlerTimeoutRef.current = window.setTimeout(() => {
    if (!map) return

    const interactiveLayers = context.layersRef.current.filter(
      (id) => !id.includes('-highlight') && map.getLayer(id)
    )

    // Remove existing handlers
    if (mapClickHandlerRef.current) {
      map.off('click', mapClickHandlerRef.current)
    }
    if (mapMouseMoveHandlerRef.current) {
      map.off('mousemove', mapMouseMoveHandlerRef.current)
    }

    // Attach map-level click handler
    const handleMapClick = createMapClickHandler(context)
    mapClickHandlerRef.current = handleMapClick
    map.on('click', handleMapClick)

    // Attach map-level mousemove handler to track hover accurately
    const handleMouseMove = createMouseMoveHandler(context)
    mapMouseMoveHandlerRef.current = handleMouseMove
    map.on('mousemove', handleMouseMove)

    // Attach hover handlers to layers for cursor styling
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
        mapInstance.on('mouseleave', layerId, () => {
          // Cursor will be updated by mousemove handler
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
  mapClickHandlerRef: React.MutableRefObject<((e: maplibregl.MapMouseEvent) => void) | null>,
  mapMouseMoveHandlerRef: React.MutableRefObject<((e: maplibregl.MapMouseEvent) => void) | null>
): void => {
  if (mapClickHandlerRef.current) {
    try {
      map.off('click', mapClickHandlerRef.current)
      mapClickHandlerRef.current = null
    } catch {
      // Ignore errors
    }
  }

  if (mapMouseMoveHandlerRef.current) {
    try {
      map.off('mousemove', mapMouseMoveHandlerRef.current)
      mapMouseMoveHandlerRef.current = null
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
