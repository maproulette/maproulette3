import type maplibregl from 'maplibre-gl'
import type { TaskMarker } from '@/types/Task'
import { CLUSTER_CONFIG, LAYER_IDS } from './const'
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

  const clusterLayerId = LAYER_IDS.clusters
  const clusterLayer = map.current.getLayer(clusterLayerId)

  const clusterLayerIds = clusterLayer
    ? [clusterLayerId]
    : (() => {
        const style = map.current.getStyle()
        return (
          style?.layers
            ?.filter((layer) => layer.id.includes('task-clusters'))
            .map((layer) => layer.id) || []
        )
      })()

  if (clusterLayerIds.length === 0) return

  const features = map.current.queryRenderedFeatures(e.point, {
    layers: clusterLayerIds,
  })

  if (!features || features.length === 0) return

  const clusterFeature = features.find(
    (f) => f.layer?.id === clusterLayerId || f.layer?.id?.includes('task-clusters')
  )

  if (!clusterFeature) return

  const geometry = clusterFeature.geometry
  if (!geometry || geometry.type !== 'Point') return

  const coords = geometry.coordinates as number[]
  if (!coords || coords.length < 2) return

  const lng = Number(coords[0])
  const lat = Number(coords[1])

  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    console.error('Invalid coordinates:', coords)
    return
  }

  const clusterScreenPoint = map.current.project([lng, lat])
  const clickPoint = e.point

  const distance = Math.sqrt(
    (clickPoint.x - clusterScreenPoint.x) ** 2 + (clickPoint.y - clusterScreenPoint.y) ** 2
  )

  const pointCount =
    clusterFeature.properties?.point_count || clusterFeature.properties?.taskCount || 0
  let clusterRadius = CLUSTER_CONFIG.sizes[0]
  if (pointCount >= CLUSTER_CONFIG.steps[1]) {
    clusterRadius = CLUSTER_CONFIG.sizes[2]
  } else if (pointCount >= CLUSTER_CONFIG.steps[0]) {
    clusterRadius = CLUSTER_CONFIG.sizes[1]
  }

  if (distance > clusterRadius * 1.2) {
    return
  }

  const clusterId = clusterFeature.properties?.cluster_id
  const source = map.current.getSource(sourceId)
  if (!source || !isGeoJSONSource(source)) return

  // @ts-expect-error - MapLibre doesn't expose cluster property in types
  const hasClientSideClustering = source.cluster === true

  const zoomIn = () => {
    if (!map.current) return
    const currentZoom = map.current.getZoom()
    map.current.easeTo({
      center: [lng, lat],
      zoom: currentZoom + 2,
    })
  }

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
      zoomIn()
    }
  } else {
    zoomIn()
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
  if (!map.current) {
    return
  }

  const pointLayerId = LAYER_IDS.points
  const pointLayer = map.current.getLayer(pointLayerId)

  const pointLayerIds = pointLayer
    ? [pointLayerId]
    : (() => {
        const style = map.current.getStyle()
        return (
          style?.layers
            ?.filter(
              (layer) =>
                layer.id.includes('task-unclustered-point') ||
                layer.id.includes('task-markers-points')
            )
            .map((layer) => layer.id) || []
        )
      })()

  let feature: GeoJSON.Feature | undefined

  if ('features' in e && e.features && e.features.length > 0) {
    feature = e.features[0] as GeoJSON.Feature
  } else {
    const features = map.current.queryRenderedFeatures(e.point, {
      layers: pointLayerIds.length > 0 ? pointLayerIds : undefined,
    })
    feature = features[0] as GeoJSON.Feature | undefined
  }

  if (!feature) {
    return
  }

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
    if (!map.current) {
      return
    }

    const taskMarkerLayerIds = [chunkIds.points, chunkIds.clusters, chunkIds.clusterCount].filter(
      (id) => {
        const layer = map.current?.getLayer(id)
        if (!layer) return false
        const visibility = (layer.layout as { visibility?: string } | undefined)?.visibility
        return visibility !== 'none'
      }
    )

    if (taskMarkerLayerIds.length === 0) {
      return
    }

    const allFeatures = map.current.queryRenderedFeatures(e.point, {
      layers: taskMarkerLayerIds,
    })

    if (!allFeatures || allFeatures.length === 0) {
      return
    }

    // Helper function to check if a layer ID is a cluster layer
    const isClusterLayer = (layerId: string | undefined): boolean =>
      !!(
        layerId &&
        (layerId === chunkIds.clusters ||
          (layerId.includes('task-clusters') && !layerId.includes('unclustered')))
      )

    // Helper function to check if a layer ID is a point layer
    const isPointLayer = (layerId: string | undefined): boolean =>
      !!(
        layerId &&
        (layerId === chunkIds.points ||
          layerId.includes('task-unclustered-point') ||
          layerId.includes('task-markers-points'))
      )

    // Prioritize clusters: check if ANY feature is a cluster
    const clusterFeature = allFeatures.find((f) => isClusterLayer(f.layer?.id))
    if (clusterFeature) {
      handleClusterClick(map, e, chunkIds.source)
      return
    }

    // If no cluster, check for point features
    const pointFeature = allFeatures.find((f) => isPointLayer(f.layer?.id))
    if (pointFeature) {
      handleMarkerClick(map, e, chunkIds.source)
      return
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
  chunkIds = LAYER_IDS
): (() => void) => {
  if (!map.current) {
    return () => {}
  }

  type MapClickHandlerRef = {
    current: ((e: maplibregl.MapMouseEvent) => void) | null
    wrapper?: ((e: maplibregl.MapMouseEvent) => void) | null
    canvasHandler?: ((e: MouseEvent) => void) | null
  }
  const mapClickHandlerRef: MapClickHandlerRef = {
    current: null,
  }

  let timeoutId: number | null = null
  let isCleanedUp = false

  timeoutId = window.setTimeout(() => {
    if (isCleanedUp || !map.current) {
      return
    }

    let attempts = 0
    const maxAttempts = 10

    let handlerWrapper: ((e: maplibregl.MapMouseEvent) => void) | null = null

    const checkLayers = () => {
      if (!map.current) {
        return
      }

      attempts++
      const pointLayer = map.current.getLayer(chunkIds.points)
      const clusterLayer = map.current.getLayer(chunkIds.clusters)

      if (!pointLayer && !clusterLayer && attempts < maxAttempts) {
        setTimeout(checkLayers, 100)
        return
      }

      if (!pointLayer && !clusterLayer) {
        return
      }

      if (mapClickHandlerRef.wrapper) {
        map.current.off('click', mapClickHandlerRef.wrapper)
      }

      const mapClickHandler = createTaskMarkerClickHandler(map, chunkIds)
      mapClickHandlerRef.current = mapClickHandler

      handlerWrapper = (e: maplibregl.MapMouseEvent) => {
        mapClickHandler(e)
      }

      mapClickHandlerRef.wrapper = handlerWrapper
      map.current.on('click', handlerWrapper)

      const canvas = map.current.getCanvasContainer()
      if (canvas && handlerWrapper) {
        const canvasClickHandler = (e: MouseEvent) => {
          if (map.current && handlerWrapper) {
            const mapEvent = {
              point: { x: e.offsetX, y: e.offsetY },
              lngLat: map.current.unproject([e.offsetX, e.offsetY]),
              originalEvent: e,
            } as maplibregl.MapMouseEvent
            handlerWrapper(mapEvent)
          }
        }
        canvas.addEventListener('click', canvasClickHandler, true)
        mapClickHandlerRef.canvasHandler = canvasClickHandler
      }
    }

    checkLayers()

    const pointMouseEnterHandler = (e: maplibregl.MapLayerMouseEvent) => {
      setCursor(map, 'pointer')
      if (!map.current || !e.features || e.features.length === 0) {
        return
      }

      const feature = e.features[0]
      const taskId = feature.properties?.id
      const featureId = feature.id

      if (taskId !== undefined && featureId !== undefined) {
        try {
          map.current.setFeatureState({ source: chunkIds.source, id: featureId }, { hover: true })
        } catch (_err) {
          console.error('pointMouseEnterHandler: Error setting feature state', _err)
        }
      }
    }

    const pointMouseLeaveHandler = (e: maplibregl.MapLayerMouseEvent) => {
      setCursor(map, '')
      if (!map.current || !e.features || e.features.length === 0) return

      const feature = e.features[0]
      const featureId = feature.id

      if (featureId !== undefined) {
        try {
          map.current.setFeatureState({ source: chunkIds.source, id: featureId }, { hover: false })
        } catch (_err) {}
      }
    }

    const clusterMouseEnterHandler = () => setCursor(map, 'pointer')
    const clusterMouseLeaveHandler = () => setCursor(map, '')

    const mapInstance = map.current as maplibregl.Map & {
      off(event: string, layerId: string): void
      on(event: string, layerId: string, handler: (e: maplibregl.MapLayerMouseEvent) => void): void
    }

    try {
      mapInstance.on('mouseenter', chunkIds.clusters, clusterMouseEnterHandler)
      mapInstance.on('mouseleave', chunkIds.clusters, clusterMouseLeaveHandler)
      mapInstance.on('mouseenter', chunkIds.points, pointMouseEnterHandler)
      mapInstance.on('mouseleave', chunkIds.points, pointMouseLeaveHandler)
    } catch (_error) {
      console.error('setupEventListeners: Error attaching layer event handlers', _error)
    }
  }, 100)

  return () => {
    isCleanedUp = true
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    if (!map.current) return

    try {
      const canvas = map.current.getCanvasContainer()
      if (canvas && mapClickHandlerRef.canvasHandler) {
        canvas.removeEventListener('click', mapClickHandlerRef.canvasHandler, true)
        mapClickHandlerRef.canvasHandler = undefined
      }

      if (mapClickHandlerRef.wrapper) {
        map.current.off('click', mapClickHandlerRef.wrapper)
        mapClickHandlerRef.wrapper = undefined
        mapClickHandlerRef.current = null
      }

      const mapInstance = map.current as maplibregl.Map & {
        off(event: string, layerId: string): void
      }
      try {
        mapInstance.off('mouseenter', chunkIds.clusters)
        mapInstance.off('mouseleave', chunkIds.clusters)
        mapInstance.off('mouseenter', chunkIds.points)
        mapInstance.off('mouseleave', chunkIds.points)
      } catch (_error) {
        // Ignore errors - layers might not exist
      }
    } catch (_error) {
      // Silently handle cleanup errors
    }
  }
}
