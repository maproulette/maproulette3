import type maplibregl from 'maplibre-gl'
import type { TaskFeaturesEventHandlerContext } from './types'
import { getTaskFeatureId, isValidTaskFeature } from './utils'

export const createTaskFeaturesMouseEnterHandler = (context: TaskFeaturesEventHandlerContext) => {
  const { map, sourceId, currentPopupRef, hoveredFeatureIdsRef, highlightedFeatureIdsRef, selectedTaskIds, setHoveredTaskId } = context

  return (e: maplibregl.MapLayerMouseEvent) => {
    if (!e.features || e.features.length === 0 || !map.current) return

    if (currentPopupRef.current) {
      return
    }

    const validFeatures = e.features.filter(isValidTaskFeature)
    const newHoveredIds = new Set<string>()

    validFeatures.forEach((feature) => {
      const featureId = getTaskFeatureId(feature)
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

    // Update feature properties for icon selection (task markers need this)
    updateTaskFeaturePropertiesForHover(map, sourceId, newHoveredIds, selectedTaskIds)

    // Update hoveredTaskId in context
    if (setHoveredTaskId) {
      const firstHoveredId = newHoveredIds.size > 0 ? Array.from(newHoveredIds)[0] : null
      const taskId = firstHoveredId ? Number(firstHoveredId) : null
      setHoveredTaskId(taskId)
    }
  }
}

export const createTaskFeaturesMouseLeaveHandler = (context: TaskFeaturesEventHandlerContext) => {
  const { map, sourceId, currentPopupRef, hoveredFeatureIdsRef, highlightedFeatureIdsRef, selectedTaskIds, setHoveredTaskId } = context

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

    // Update feature properties to clear hover
    updateTaskFeaturePropertiesForHover(map, sourceId, new Set<string>(), selectedTaskIds)

    // Update hoveredTaskId in context
    if (setHoveredTaskId) {
      setHoveredTaskId(null)
    }
  }
}

export const createTaskFeaturesMouseMoveHandler = (context: TaskFeaturesEventHandlerContext) => {
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

    const taskLayerIds = layersRef.current.filter((id) => !id.includes('-highlight'))
    if (taskLayerIds.length === 0) {
      map.current.getCanvas().style.cursor = ''
      return
    }

    const taskFeatures = map.current.queryRenderedFeatures(e.point, {
      layers: taskLayerIds,
    })

    const validTaskFeatures = taskFeatures.filter(isValidTaskFeature)
    const currentlyHoveredIds = new Set<string>()

    validTaskFeatures.forEach((feature) => {
      const featureId = getTaskFeatureId(feature)
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

    // Update feature properties for icon selection (task markers need this)
    updateTaskFeaturePropertiesForHover(map, sourceId, currentlyHoveredIds, context.selectedTaskIds)

    // Update hoveredTaskId in context
    if (context.setHoveredTaskId) {
      const firstHoveredId = currentlyHoveredIds.size > 0 ? Array.from(currentlyHoveredIds)[0] : null
      const taskId = firstHoveredId ? Number(firstHoveredId) : null
      context.setHoveredTaskId(taskId)
    }
  }
}

// Helper to update feature properties for task markers (needed for icon selection)
const updateTaskFeaturePropertiesForHover = (
  map: React.RefObject<maplibregl.Map | null>,
  sourceId: string,
  hoveredIds: Set<string>,
  selectedTaskIds: number[]
) => {
  if (!map.current) return

  const source = map.current.getSource(sourceId)
  if (!source || source.type !== 'geojson') return

  const geoJsonSource = source as maplibregl.GeoJSONSource
  const currentData = geoJsonSource._data as GeoJSON.FeatureCollection

  if (!currentData?.features) return

  let dataChanged = false

  currentData.features.forEach((feature) => {
    if (!feature || !feature.properties || feature.id === undefined) return

    const taskId = feature.properties.id
    if (taskId === undefined) return

    const featureId = String(feature.id !== undefined ? feature.id : taskId)
    const isHovered = hoveredIds.has(featureId)
    const isSelected = selectedTaskIds.includes(taskId)

    if (feature.properties.isHovered !== isHovered || feature.properties.isSelected !== isSelected) {
      feature.properties.isHovered = isHovered
      feature.properties.isSelected = isSelected
      dataChanged = true
    }
  })

  if (dataChanged) {
    geoJsonSource.setData(currentData)
  }
}

