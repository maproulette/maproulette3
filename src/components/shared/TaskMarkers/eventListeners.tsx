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
  e: maplibregl.MapMouseEvent,
  sourceId: string = LAYER_IDS.source
) => {
  if (!map.current) return

  const style = map.current.getStyle()
  const pointLayerIds =
    style?.layers
      ?.filter(
        (layer) =>
          layer.id.includes('task-unclustered-point') || layer.id.includes('task-markers-points')
      )
      .map((layer) => layer.id) || []

  const features = map.current.queryRenderedFeatures(e.point, {
    layers: pointLayerIds.length > 0 ? pointLayerIds : undefined,
  })
  if (!features[0]) return

  const feature = features[0]
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
 * Setup event listeners for a specific set of layer IDs
 * Supports both single source and chunked sources
 * Returns a cleanup function to remove all event listeners
 */
export const setupEventListeners = (
  map: React.RefObject<maplibregl.Map | null>,
  chunkIds = LAYER_IDS,
  setHoveredTaskId?: (taskId: number | null) => void
): (() => void) => {
  if (!map.current) return () => {}

  const clusterClickHandler = (e: maplibregl.MapMouseEvent) =>
    handleClusterClick(map, e, chunkIds.source)
  const clusterMouseEnterHandler = () => setCursor(map, 'pointer')
  const clusterMouseLeaveHandler = () => setCursor(map, '')

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

  const pointClickHandler = (e: maplibregl.MapMouseEvent) =>
    handleMarkerClick(map, e, chunkIds.source)

  map.current.on('click', chunkIds.clusters, clusterClickHandler)
  map.current.on('mouseenter', chunkIds.clusters, clusterMouseEnterHandler)
  map.current.on('mouseleave', chunkIds.clusters, clusterMouseLeaveHandler)

  map.current.on('click', chunkIds.points, pointClickHandler)
  map.current.on('mouseenter', chunkIds.points, pointMouseEnterHandler)
  map.current.on('mouseleave', chunkIds.points, pointMouseLeaveHandler)

  // Return cleanup function
  return () => {
    if (!map.current) return

    try {
      map.current.off('click', chunkIds.clusters, clusterClickHandler)
      map.current.off('mouseenter', chunkIds.clusters, clusterMouseEnterHandler)
      map.current.off('mouseleave', chunkIds.clusters, clusterMouseLeaveHandler)
      map.current.off('click', chunkIds.points, pointClickHandler)
      map.current.off('mouseenter', chunkIds.points, pointMouseEnterHandler)
      map.current.off('mouseleave', chunkIds.points, pointMouseLeaveHandler)
    } catch (error) {
      // Ignore errors when removing listeners (layer might not exist)
      console.warn('Error removing event listeners:', error)
    }
  }
}
