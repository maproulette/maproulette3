import maplibregl from 'maplibre-gl'
import { createRoot } from 'react-dom/client'
import type { TaskMarker } from '@/types/Task'
import { LAYER_IDS } from './const'
import { OverlapPopup, SingleTaskPopup } from '../OverlapedMarkersPopup'

const isGeoJSONSource = (source: maplibregl.Source): source is maplibregl.GeoJSONSource => {
  return source.type === 'geojson'
}

export const handleClusterClick = async (
  map: React.RefObject<maplibregl.Map | null>,
  e: maplibregl.MapMouseEvent,
  sourceId: string = LAYER_IDS.source
) => {
  if (!map.current) return

  // Query all cluster layers at this point
  const style = map.current.getStyle()
  const clusterLayerIds = style?.layers
    ?.filter((layer) => layer.id.includes('task-clusters'))
    .map((layer) => layer.id) || []

  const features = map.current.queryRenderedFeatures(e.point, {
    layers: clusterLayerIds.length > 0 ? clusterLayerIds : undefined,
  })
  if (!features[0]) return

  const clusterId = features[0].properties?.cluster_id
  const source = map.current.getSource(sourceId)
  if (!source || !isGeoJSONSource(source)) return

  try {
    const zoom = await source.getClusterExpansionZoom(clusterId)
    const geometry = features[0].geometry
    if (map.current && geometry && geometry.type === 'Point' && geometry.coordinates.length === 2) {
      map.current.easeTo({
        center: [geometry.coordinates[0], geometry.coordinates[1]],
        zoom,
      })
    }
  } catch (error) {
    console.error('Error expanding cluster:', error)
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

  // Query all point layers at this point
  const style = map.current.getStyle()
  const pointLayerIds = style?.layers
    ?.filter((layer) => layer.id.includes('task-unclustered-point') || layer.id.includes('task-markers-points'))
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

  // If this is an overlapping task, show overlap popup
  if (isOverlapping && overlapId) {
    // Query all features with the same overlapId to get all overlapping tasks
    const allFeatures = map.current.querySourceFeatures(sourceId, {
      filter: ['==', ['get', 'overlapId'], overlapId],
    })

    // Remove duplicates by task ID
    const uniqueTasksMap = new Map<string, TaskMarker>()

    allFeatures
      .filter((f) => f.properties?.overlapId === overlapId)
      .forEach((f) => {
        const taskId = String(f.properties?.id)
        if (!uniqueTasksMap.has(taskId)) {
          uniqueTasksMap.set(taskId, {
            id: taskId,
            status: Number(f.properties?.status),
            location: {
              lng: (f.geometry as GeoJSON.Point).coordinates[0],
              lat: (f.geometry as GeoJSON.Point).coordinates[1],
            },
          })
        }
      })

    const overlappingTasks: TaskMarker[] = Array.from(uniqueTasksMap.values())

    // Remove existing popups
    const existingPopups = document.querySelectorAll('.maplibregl-popup')
    existingPopups.forEach((popup) => {
      popup.remove()
    })

    // Create a container for the React component
    const popupContainer = document.createElement('div')
    
    // Create new popup with larger max width for overlap content
    const popup = new maplibregl.Popup({
      closeOnClick: true,
      closeButton: true,
      maxWidth: '350px',
    })
      .setLngLat(coordinates)
      .setDOMContent(popupContainer)
      .addTo(map.current)

    // Render the React component into the popup container
    const root = createRoot(popupContainer)
    root.render(<OverlapPopup tasks={overlappingTasks} />)

    // Clean up React root when popup is closed
    popup.on('close', () => {
      root.unmount()
    })
  } else {
    // Regular single task popup
    const task: TaskMarker = {
      id: String(id),
      status: Number(status),
      location: { lng: coordinates[0], lat: coordinates[1] },
    }

    // Remove existing popups
    const existingPopups = document.querySelectorAll('.maplibregl-popup')
    existingPopups.forEach((popup) => {
      popup.remove()
    })

    // Create a container for the React component
    const popupContainer = document.createElement('div')

    // Create new popup
    const popup = new maplibregl.Popup({ closeOnClick: true, closeButton: true })
      .setLngLat(coordinates)
      .setDOMContent(popupContainer)
      .addTo(map.current)

    // Render the React component into the popup container
    const root = createRoot(popupContainer)
    root.render(<SingleTaskPopup task={task} />)

    // Clean up React root when popup is closed
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

  // Cluster event listeners
  map.current.on('click', chunkIds.clusters, (e: maplibregl.MapMouseEvent) =>
    handleClusterClick(map, e, chunkIds.source)
  )
  map.current.on('mouseenter', chunkIds.clusters, () => setCursor(map, 'pointer'))
  map.current.on('mouseleave', chunkIds.clusters, () => setCursor(map, ''))

  // Individual marker event listeners (now handles both regular and overlapping tasks)
  map.current.on('click', chunkIds.points, (e: maplibregl.MapMouseEvent) =>
    handleMarkerClick(map, e, chunkIds.source)
  )
  map.current.on('mouseenter', chunkIds.points, () => setCursor(map, 'pointer'))
  map.current.on('mouseleave', chunkIds.points, () => setCursor(map, ''))
}
