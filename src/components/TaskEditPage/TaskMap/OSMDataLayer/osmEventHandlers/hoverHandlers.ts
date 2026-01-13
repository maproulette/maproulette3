import type maplibregl from 'maplibre-gl'
import type { EventHandlerContext } from './types'
import { getFeatureId, isValidOSMFeature } from './utils'

export const createMouseEnterHandler = (context: EventHandlerContext) => {
  const { map, sourceId, currentPopupRef, hoveredFeatureIdsRef, highlightedFeatureIdsRef } = context

  return (e: maplibregl.MapLayerMouseEvent) => {
    if (!e.features || e.features.length === 0 || !map.current) return

    if (currentPopupRef.current) {
      return
    }

    const validFeatures = e.features.filter(isValidOSMFeature)
    const newHoveredIds = new Set<string>()

    validFeatures.forEach((feature) => {
      const featureId = getFeatureId(feature)
      if (!featureId) return

      if (highlightedFeatureIdsRef.current.has(featureId)) {
        return
      }

      newHoveredIds.add(featureId)
    })

    hoveredFeatureIdsRef.current.forEach((featureId) => {
      if (!newHoveredIds.has(featureId)) {
        try {
          if (map.current) {
            map.current.setFeatureState({ source: sourceId, id: featureId }, { hover: false })
          }
        } catch {}
      }
    })

    newHoveredIds.forEach((featureId) => {
      if (!hoveredFeatureIdsRef.current.has(featureId)) {
        try {
          if (map.current) {
            map.current.setFeatureState({ source: sourceId, id: featureId }, { hover: true })
          }
        } catch {}
      }
    })

    hoveredFeatureIdsRef.current = newHoveredIds
  }
}

export const createMouseLeaveHandler = (context: EventHandlerContext) => {
  const { map, sourceId, currentPopupRef, hoveredFeatureIdsRef, highlightedFeatureIdsRef } = context

  return () => {
    if (!map.current) return

    if (currentPopupRef.current) {
      return
    }

    hoveredFeatureIdsRef.current.forEach((featureId) => {
      if (highlightedFeatureIdsRef.current.has(featureId)) {
        return
      }

      try {
        if (map.current) {
          map.current.setFeatureState({ source: sourceId, id: featureId }, { hover: false })
        }
      } catch {}
    })
    hoveredFeatureIdsRef.current.clear()
  }
}

export const createMouseMoveHandler = (context: EventHandlerContext) => {
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

    if (currentlyHoveredIds.size > 0) {
      map.current.getCanvas().style.cursor = 'pointer'
    } else {
      map.current.getCanvas().style.cursor = ''
    }

    hoveredFeatureIdsRef.current.forEach((featureId) => {
      if (!currentlyHoveredIds.has(featureId)) {
        try {
          map.current?.setFeatureState({ source: sourceId, id: featureId }, { hover: false })
        } catch {}
      }
    })

    currentlyHoveredIds.forEach((featureId) => {
      if (!hoveredFeatureIdsRef.current.has(featureId)) {
        try {
          map.current?.setFeatureState({ source: sourceId, id: featureId }, { hover: true })
        } catch {}
      }
    })

    hoveredFeatureIdsRef.current = currentlyHoveredIds
  }
}
