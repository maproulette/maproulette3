import maplibregl from 'maplibre-gl'
import { createRoot } from 'react-dom/client'
import { OverlapPopup, SingleTaskPopup } from '@/components/OverlapedMarkersPopup'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import type { TaskMarker } from '@/types/Task'

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
  const source = map.current.getSource(LAYER_IDS.source)
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

  if (isOverlapping && overlapId) {
    const allFeatures = map.current.querySourceFeatures(LAYER_IDS.source, {
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
      closeOnClick: true,
      closeButton: true,
      maxWidth: '350px',
    })
      .setLngLat(coordinates)
      .setDOMContent(popupContainer)
      .addTo(map.current)

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

    const popup = new maplibregl.Popup({ closeOnClick: true, closeButton: true })
      .setLngLat(coordinates)
      .setDOMContent(popupContainer)
      .addTo(map.current)

    const root = createRoot(popupContainer)
    root.render(<SingleTaskPopup task={task} />)

    popup.on('close', () => {
      root.unmount()
    })
  }
}

export const setupEventListeners = (map: React.RefObject<maplibregl.Map | null>) => {
  if (!map.current) return

  map.current.on('click', LAYER_IDS.clusters, (e: maplibregl.MapMouseEvent) =>
    handleClusterClick(map, e)
  )
  map.current.on('mouseenter', LAYER_IDS.clusters, () => setCursor(map, 'pointer'))
  map.current.on('mouseleave', LAYER_IDS.clusters, () => setCursor(map, ''))

  map.current.on('click', LAYER_IDS.points, (e: maplibregl.MapMouseEvent) =>
    handleMarkerClick(map, e)
  )
  map.current.on('mouseenter', LAYER_IDS.points, () => setCursor(map, 'pointer'))
  map.current.on('mouseleave', LAYER_IDS.points, () => setCursor(map, ''))
}
