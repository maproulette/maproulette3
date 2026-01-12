import type maplibregl from 'maplibre-gl'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import type { TaskMarker } from '@/types/Task'
import {
  extractTaskMarkersFromFeatures,
  showOverlapPopup,
  showSingleTaskPopup,
} from './utils/popupUtils'

const isGeoJSONSource = (source: maplibregl.Source): source is maplibregl.GeoJSONSource => {
  return source.type === 'geojson'
}

export const handleClusterClick = async (
  map: React.RefObject<maplibregl.Map | null>,
  e: maplibregl.MapMouseEvent,
  sourceId: string = LAYER_IDS.source
) => {
  if (!map.current) return

  const style = map.current.getStyle()
  const clusterLayerIds =
    style?.layers?.filter((layer) => layer.id.includes('task-clusters')).map((layer) => layer.id) ||
    []

  const features = map.current.queryRenderedFeatures(e.point, {
    layers: clusterLayerIds.length > 0 ? clusterLayerIds : undefined,
  })
  if (!features[0]) return

  const geometry = features[0].geometry
  if (!geometry || geometry.type !== 'Point') return

  const coords = geometry.coordinates as number[]
  if (!coords || coords.length < 2) return

  const lng = Number(coords[0])
  const lat = Number(coords[1])

  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    console.error('Invalid coordinates:', coords)
    return
  }

  const clusterId = features[0].properties?.cluster_id
  const source = map.current.getSource(sourceId)
  if (!source || !isGeoJSONSource(source)) return

  // @ts-expect-error - MapLibre doesn't expose cluster property in types
  const hasClientSideClustering = source.cluster === true

  if (hasClientSideClustering && clusterId !== undefined) {
    try {
      const zoom = await source.getClusterExpansionZoom(clusterId)
      if (Number.isFinite(zoom) && map.current) {
        map.current.easeTo({
          center: [lng, lat],
          zoom,
        })
      }
    } catch (error) {
      console.error('Error getting cluster expansion zoom:', error)

      const currentZoom = map.current.getZoom()
      map.current.easeTo({
        center: [lng, lat],
        zoom: currentZoom + 2,
      })
    }
  } else {
    const currentZoom = map.current.getZoom()
    map.current.easeTo({
      center: [lng, lat],
      zoom: currentZoom + 2,
    })
  }
}

export const setCursor = (map: React.RefObject<maplibregl.Map | null>, cursor: string) => {
  if (map.current) {
    map.current.getCanvas().style.cursor = cursor
  }
}

export const handleMarkerClick = (
  map: React.RefObject<maplibregl.Map | null>,
  e: maplibregl.MapMouseEvent | maplibregl.MapLayerMouseEvent,
  sourceId: string = LAYER_IDS.source
) => {
  if (!map.current) return

  // Use the actual layer ID from LAYER_IDS, with fallback to finding by name
  const pointLayerId = LAYER_IDS.points
  const pointLayer = map.current.getLayer(pointLayerId)
  
  // If layer doesn't exist, try to find it by name (for backwards compatibility)
  const pointLayerIds = pointLayer
    ? [pointLayerId]
    : (() => {
        const style = map.current.getStyle()
        return (
          style?.layers
            ?.filter(
              (layer) =>
                layer.id.includes('task-unclustered-point') || layer.id.includes('task-markers-points')
            )
            .map((layer) => layer.id) || []
        )
      })()

  // First try to use features from the event (most reliable when clicking on a layer)
  // MapLayerMouseEvent has features, MapMouseEvent doesn't
  let feature: GeoJSON.Feature | undefined
  
  if ('features' in e && e.features && e.features.length > 0) {
    // Use the feature from the event - this is provided when clicking directly on a layer
    feature = e.features[0] as GeoJSON.Feature
  } else {
    // Fallback to queryRenderedFeatures if event doesn't have features
    const features = map.current.queryRenderedFeatures(e.point, {
      layers: pointLayerIds.length > 0 ? pointLayerIds : undefined,
    })
    feature = features[0] as GeoJSON.Feature | undefined
  }
  
  if (!feature) return
  const { id, status, isOverlapping, overlapId } = feature.properties || {}

  const coordinates =
    feature.geometry && feature.geometry.type === 'Point'
      ? (feature.geometry.coordinates as [number, number])
      : null

  if (!coordinates) return

  if (isOverlapping && overlapId) {
    const allFeatures = map.current.querySourceFeatures(sourceId, {
      filter: ['==', ['get', 'overlapId'], overlapId],
    })

    const overlappingTasks = extractTaskMarkersFromFeatures(allFeatures, overlapId)
    showOverlapPopup(map.current, coordinates, overlappingTasks)
  } else {
    const task: TaskMarker = {
      id: Number(id),
      status: Number(status),
      priority: Number(feature.properties?.priority ?? 0),
      location: { lng: coordinates[0], lat: coordinates[1] },
    }

    showSingleTaskPopup(map.current, coordinates, task)
  }
}

/**
 * Creates map-level click handler for task markers (similar to OSM data layer)
 */
const createTaskMarkerClickHandler = (
  map: React.RefObject<maplibregl.Map | null>,
  chunkIds = LAYER_IDS
) => {
  return (e: maplibregl.MapMouseEvent) => {
    if (!map.current) return

    // Use exact layer IDs from LAYER_IDS
    const taskMarkerLayerIds = [chunkIds.points, chunkIds.clusters, chunkIds.clusterCount].filter(
      (id) => {
        const layer = map.current?.getLayer(id)
        if (!layer) return false
        // Check if layer is visible
        const layout = layer.layout as { visibility?: string } | undefined
        const visibility = layout?.visibility
        return visibility !== 'none'
      }
    )

    if (taskMarkerLayerIds.length === 0) return

    // Check clusters first
    const clusterLayerIds = taskMarkerLayerIds.filter((id) => id === chunkIds.clusters)
    if (clusterLayerIds.length > 0) {
      const clusterFeatures = map.current.queryRenderedFeatures(e.point, {
        layers: clusterLayerIds,
      })
      if (clusterFeatures && clusterFeatures.length > 0) {
        handleClusterClick(map, e, chunkIds.source)
        return
      }
    }

    // Check point markers (exact layer ID)
    const pointLayerIds = taskMarkerLayerIds.filter((id) => id === chunkIds.points)
    if (pointLayerIds.length > 0) {
      const pointFeatures = map.current.queryRenderedFeatures(e.point, {
        layers: pointLayerIds,
      })
      if (pointFeatures && pointFeatures.length > 0) {
        handleMarkerClick(map, e, chunkIds.source)
        return
      }
    }
  }
}

/**
 * Setup event listeners for a specific set of layer IDs
 * Uses map-level click handler like OSM data layer
 * Returns a cleanup function to remove all event listeners
 */
export const setupEventListeners = (
  map: React.RefObject<maplibregl.Map | null>,
  chunkIds = LAYER_IDS,
  setHoveredTaskId?: (taskId: number | null) => void
): (() => void) => {
  if (!map.current) return () => {}

  // Use a ref to store the click handler (like OSM data layer)
  const mapClickHandlerRef: { current: ((e: maplibregl.MapMouseEvent) => void) | null } = {
    current: null,
  }

  // Wait for layers to be fully added (like OSM data layer)
  const timeoutId = window.setTimeout(() => {
    if (!map.current) return

    // Remove existing map click handler if it exists
    if (mapClickHandlerRef.current) {
      map.current.off('click', mapClickHandlerRef.current)
    }

    // Create and attach map-level click handler
    const mapClickHandler = createTaskMarkerClickHandler(map, chunkIds)
    mapClickHandlerRef.current = mapClickHandler
    map.current.on('click', mapClickHandler)

    // Hover handlers for task markers using feature state
    const pointMouseEnterHandler = (e: maplibregl.MapLayerMouseEvent) => {
      setCursor(map, 'pointer')
      if (!map.current || !e.features || e.features.length === 0) return

      const feature = e.features[0]
      const taskId = feature.properties?.id
      const featureId = feature.id

      if (taskId !== undefined && featureId !== undefined) {
        // Set feature state for hover effect
        try {
          map.current.setFeatureState({ source: chunkIds.source, id: featureId }, { hover: true })
        } catch (_err) {
          // Feature might not exist, ignore
        }

        // Update hovered task ID if callback provided
        if (setHoveredTaskId) {
          setHoveredTaskId(Number(taskId))
        }
      }
    }

    const pointMouseLeaveHandler = (e: maplibregl.MapLayerMouseEvent) => {
      setCursor(map, '')
      if (!map.current || !e.features || e.features.length === 0) return

      const feature = e.features[0]
      const featureId = feature.id

      if (featureId !== undefined) {
        // Clear feature state for hover effect
        try {
          map.current.setFeatureState({ source: chunkIds.source, id: featureId }, { hover: false })
        } catch (_err) {
          // Feature might not exist, ignore
        }

        // Clear hovered task ID if callback provided
        if (setHoveredTaskId) {
          setHoveredTaskId(null)
        }
      }
    }

    const clusterMouseEnterHandler = () => setCursor(map, 'pointer')
    const clusterMouseLeaveHandler = () => setCursor(map, '')

    // Attach hover handlers to layers (using type assertion like OSM data layer)
    const mapInstance = map.current as maplibregl.Map & {
      off(event: string, layerId: string): void
      on(event: string, layerId: string, handler: (e: maplibregl.MapLayerMouseEvent) => void): void
    }

    try {
      mapInstance.on('mouseenter', chunkIds.clusters, clusterMouseEnterHandler)
      mapInstance.on('mouseleave', chunkIds.clusters, clusterMouseLeaveHandler)
      mapInstance.on('mouseenter', chunkIds.points, pointMouseEnterHandler)
      mapInstance.on('mouseleave', chunkIds.points, pointMouseLeaveHandler)
    } catch (error) {
      // Layers might not exist yet, ignore
    }
  }, 100)

  // Return cleanup function
  return () => {
    clearTimeout(timeoutId)
    if (!map.current) return

    try {
      // Remove map click handler
      if (mapClickHandlerRef.current) {
        map.current.off('click', mapClickHandlerRef.current)
        mapClickHandlerRef.current = null
      }

      // Remove hover handlers (using type assertion like OSM data layer)
      const mapInstance = map.current as maplibregl.Map & {
        off(event: string, layerId: string): void
      }
      try {
        mapInstance.off('mouseenter', chunkIds.clusters)
        mapInstance.off('mouseleave', chunkIds.clusters)
        mapInstance.off('mouseenter', chunkIds.points)
        mapInstance.off('mouseleave', chunkIds.points)
      } catch (error) {
        // Ignore errors
      }
    } catch (error) {
      // Ignore errors when removing listeners (layer might not exist)
      console.warn('Error removing event listeners:', error)
    }
  }
}
