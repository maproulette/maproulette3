import type maplibregl from 'maplibre-gl'
import { Popup } from 'maplibre-gl'
import { createPopupContent } from './osmPopup'
import { handleMarkerClick, handleClusterClick } from '@/components/shared/TaskMarkers/eventListeners'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'

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
    console.log('OSM click handler called', { point: e.point })
    if (!map.current) {
      console.log('OSM click handler: No map.current')
      return
    }

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

    // Check for task markers FIRST - they should have priority
    // This ensures task marker clicks work even when OSM features are present
    // Use exact layer IDs from LAYER_IDS constant
    const taskMarkerLayerIds = [
      'task-unclustered-point',
      'task-clusters',
      'task-cluster-count',
    ].filter((id) => {
      const layer = map.current?.getLayer(id)
      if (!layer) return false
      const layout = layer.layout as { visibility?: string } | undefined
      return layout?.visibility !== 'none'
    })

    console.log('OSM click handler: Checking for task markers', {
      taskMarkerLayerIds,
      layersExist: taskMarkerLayerIds.map(id => ({
        id,
        exists: !!map.current?.getLayer(id),
        visible: (() => {
          const layer = map.current?.getLayer(id)
          const layout = layer?.layout as { visibility?: string } | undefined
          return layout?.visibility !== 'none'
        })()
      }))
    })

    if (taskMarkerLayerIds.length > 0) {
      const taskMarkerFeatures = map.current.queryRenderedFeatures(e.point, {
        layers: taskMarkerLayerIds,
      })
      console.log('OSM click handler: Task marker features found', {
        count: taskMarkerFeatures.length,
        features: taskMarkerFeatures.map(f => ({
          layer: f.layer?.id,
          id: f.id,
          properties: f.properties
        }))
      })
      if (taskMarkerFeatures && taskMarkerFeatures.length > 0) {
        console.log('OSM click handler: Found task markers, calling task marker handler directly')
        // Call task marker handler directly since we found task markers
        const feature = taskMarkerFeatures[0]
        const layerId = feature.layer?.id
        
        // Check if it's a cluster or point
        if (layerId === LAYER_IDS.clusters || layerId?.includes('cluster')) {
          console.log('OSM click handler: Calling handleClusterClick')
          handleClusterClick(map, e, LAYER_IDS.source)
        } else {
          console.log('OSM click handler: Calling handleMarkerClick')
          handleMarkerClick(map, e, LAYER_IDS.source)
        }
        // Don't process OSM features
        return
      } else {
        console.log('OSM click handler: No task marker features found at click point')
      }
    } else {
      console.log('OSM click handler: No task marker layers found or visible')
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
