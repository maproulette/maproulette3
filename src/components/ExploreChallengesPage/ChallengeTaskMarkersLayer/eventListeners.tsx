import maplibregl from 'maplibre-gl'
import type { TaskMarker } from '@/types/Task'
import { LAYER_IDS } from './const'
import { createSingleTaskPopupContent } from '@/components/OverlapedMarkersPopup'
import { createOverlapPopupContent } from '@/components/OverlapedMarkersPopup'
const isGeoJSONSource = (source: maplibregl.Source): source is maplibregl.GeoJSONSource => {
  return source.type === 'geojson'
}

export const handleClusterClick = async (
  map: React.RefObject<maplibregl.Map | null>,
  e: maplibregl.MapMouseEvent
) => {
  if (!map.current) return

  const features = map.current.queryRenderedFeatures(e.point, {
    layers: [LAYER_IDS.clusters],
  })

  if (!features[0]) return

  const geometry = features[0].geometry
  if (!geometry || geometry.type !== 'Point' || geometry.coordinates.length !== 2) return

  const clusterId = features[0].properties?.cluster_id
  const source = map.current.getSource(LAYER_IDS.source)
  if (!source || !isGeoJSONSource(source)) return

  try {
    // Check if this source has clustering enabled
    // @ts-expect-error - MapLibre doesn't expose cluster property in types
    const hasClusterSupport = source.cluster !== false

    if (hasClusterSupport) {
      // Client-side clustering: use expansion zoom
      const zoom = await source.getClusterExpansionZoom(clusterId)
      map.current.easeTo({
        center: [geometry.coordinates[0], geometry.coordinates[1]],
        zoom,
      })
    } else {
      // Backend clusters: zoom in by a fixed amount
      const currentZoom = map.current.getZoom()
      map.current.easeTo({
        center: [geometry.coordinates[0], geometry.coordinates[1]],
        zoom: currentZoom + 2,
      })
    }
  } catch (error) {
    console.error('Error expanding cluster:', error)
    // Fallback: just zoom in
    const currentZoom = map.current.getZoom()
    map.current.easeTo({
      center: [geometry.coordinates[0], geometry.coordinates[1]],
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
  e: maplibregl.MapMouseEvent
) => {
  if (!map.current) return

  const features = map.current.queryRenderedFeatures(e.point, {
    layers: [LAYER_IDS.points],
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
    const allFeatures = map.current.querySourceFeatures(LAYER_IDS.source, {
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

    const popupContent = createOverlapPopupContent({
      tasks: overlappingTasks,
    })

    // Remove existing popups
    const existingPopups = document.querySelectorAll('.maplibregl-popup')
    existingPopups.forEach((popup) => {
      popup.remove()
    })

    // Store map instance globally for popup buttons
    ;(window as unknown as Record<string, maplibregl.Map | null>).mapInstance = map.current

    // Create new popup with larger max width for overlap content
    new maplibregl.Popup({
      closeOnClick: true,
      closeButton: true,
      maxWidth: '350px',
    })
      .setLngLat(coordinates)
      .setHTML(popupContent)
      .addTo(map.current)
  } else {
    // Regular single task popup
    const task: TaskMarker = {
      id: String(id),
      status: Number(status),
      location: { lng: coordinates[0], lat: coordinates[1] },
    }

    const popupContent = createSingleTaskPopupContent(task)

    // Remove existing popups
    const existingPopups = document.querySelectorAll('.maplibregl-popup')
    existingPopups.forEach((popup) => {
      popup.remove()
    })

    // Create new popup
    new maplibregl.Popup({ closeOnClick: true, closeButton: true })
      .setLngLat(coordinates)
      .setHTML(popupContent)
      .addTo(map.current)
  }
}

export const setupEventListeners = (map: React.RefObject<maplibregl.Map | null>) => {
  if (!map.current) return

  // Cluster event listeners (for backend clusters)
  map.current.on('click', LAYER_IDS.clusters, (e: maplibregl.MapMouseEvent) =>
    handleClusterClick(map, e)
  )
  map.current.on('mouseenter', LAYER_IDS.clusters, () => setCursor(map, 'pointer'))
  map.current.on('mouseleave', LAYER_IDS.clusters, () => setCursor(map, ''))

  // Individual marker event listeners (now handles both regular and overlapping tasks)
  map.current.on('click', LAYER_IDS.points, (e: maplibregl.MapMouseEvent) =>
    handleMarkerClick(map, e)
  )
  map.current.on('mouseenter', LAYER_IDS.points, () => setCursor(map, 'pointer'))
  map.current.on('mouseleave', LAYER_IDS.points, () => setCursor(map, ''))
}
