import maplibregl from 'maplibre-gl'
import { createRoot } from 'react-dom/client'
import { OverlapPopup, SingleTaskPopup } from '@/components/OverlapedMarkersPopup'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import type { TaskMarker } from '@/types/Task'

const isGeoJSONSource = (source: maplibregl.Source): source is maplibregl.GeoJSONSource => {
  return source.type === 'geojson'
}

// Offset only when popup is above the marker (anchor-bottom) to point at marker center
const POPUP_OFFSET = {
  top: [0, 0] as [number, number],
  'top-left': [0, 0] as [number, number],
  'top-right': [0, 0] as [number, number],
  bottom: [0, -32] as [number, number],
  'bottom-left': [0, -32] as [number, number],
  'bottom-right': [0, -32] as [number, number],
  left: [0, 0] as [number, number],
  right: [0, 0] as [number, number],
} as maplibregl.Offset

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

    const uniqueTasksMap = new Map<string, TaskMarker>()

    allFeatures
      .filter((f) => f.properties?.overlapId === overlapId)
      .forEach((f) => {
        const taskId = String(f.properties?.id)
        if (!uniqueTasksMap.has(taskId)) {
          uniqueTasksMap.set(taskId, {
            id: Number(taskId),
            status: Number(f.properties?.status),
            priority: Number(f.properties?.priority ?? 0),
            location: {
              lng: (f.geometry as GeoJSON.Point).coordinates[0],
              lat: (f.geometry as GeoJSON.Point).coordinates[1],
            },
          })
        }
      })

    const overlappingTasks: TaskMarker[] = Array.from(uniqueTasksMap.values())

    const existingPopups = document.querySelectorAll('.maplibregl-popup')
    existingPopups.forEach((popup) => {
      popup.remove()
    })

    const popupContainer = document.createElement('div')

    const popup = new maplibregl.Popup({
      closeOnClick: false,
      closeButton: false,
      maxWidth: '320px',
      className: 'task-marker-popup',
      offset: POPUP_OFFSET,
    })
      .setLngLat(coordinates)
      .setDOMContent(popupContainer)
      .addTo(map.current)

    // Force popup to recalculate position after content is rendered
    requestAnimationFrame(() => {
      if (map.current && popup.isOpen()) {
        popup.setLngLat(coordinates)
      }
    })

    const root = createRoot(popupContainer)
    root.render(<OverlapPopup tasks={overlappingTasks} />)

    popup.on('close', () => {
      root.unmount()
    })
  } else {
    const task: TaskMarker = {
      id: Number(id),
      status: Number(status),
      priority: Number(feature.properties?.priority ?? 0),
      location: { lng: coordinates[0], lat: coordinates[1] },
    }

    const existingPopups = document.querySelectorAll('.maplibregl-popup')
    existingPopups.forEach((popup) => {
      popup.remove()
    })

    const popupContainer = document.createElement('div')

    const popup = new maplibregl.Popup({
      closeOnClick: false,
      closeButton: false,
      maxWidth: '260px',
      className: 'task-marker-popup',
      offset: POPUP_OFFSET,
    })
      .setLngLat(coordinates)
      .setDOMContent(popupContainer)
      .addTo(map.current)

    // Force popup to recalculate position after content is rendered
    requestAnimationFrame(() => {
      if (map.current && popup.isOpen()) {
        popup.setLngLat(coordinates)
      }
    })

    const root = createRoot(popupContainer)
    root.render(<SingleTaskPopup task={task} />)

    popup.on('close', () => {
      root.unmount()
    })
  }
}

/**
 * Setup event listeners for a specific set of layer IDs
 * Supports both single source and chunked sources
 */
export const setupEventListeners = (
  map: React.RefObject<maplibregl.Map | null>,
  chunkIds = LAYER_IDS
) => {
  if (!map.current) return

  map.current.on('click', chunkIds.clusters, (e: maplibregl.MapMouseEvent) =>
    handleClusterClick(map, e, chunkIds.source)
  )
  map.current.on('mouseenter', chunkIds.clusters, () => setCursor(map, 'pointer'))
  map.current.on('mouseleave', chunkIds.clusters, () => setCursor(map, ''))

  map.current.on('click', chunkIds.points, (e: maplibregl.MapMouseEvent) =>
    handleMarkerClick(map, e, chunkIds.source)
  )
  map.current.on('mouseenter', chunkIds.points, () => setCursor(map, 'pointer'))
  map.current.on('mouseleave', chunkIds.points, () => setCursor(map, ''))
}
