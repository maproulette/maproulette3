import maplibregl from 'maplibre-gl'
import type { Task } from '@/types/Task'
import { isLineString, isPoint, isPolygon } from '@/utils/featureTypes'

export const zoomToTask = (map: maplibregl.Map, task: Task) => {
  // First, try to use geometries if available
  if (task.geometries && typeof task.geometries === 'string' && task.geometries.length > 0) {
    let parsedGeometries: GeoJSON.FeatureCollection
    try {
      parsedGeometries = JSON.parse(task.geometries)
    } catch (error) {
      console.error('Failed to parse geometries:', error)
      // Fall through to try location instead
      return tryZoomToLocation(map, task)
    }

    const bounds = new maplibregl.LngLatBounds()
    let foundGeometry = false

    parsedGeometries.features.forEach((feature: GeoJSON.Feature) => {
      if (!feature.geometry) return

      const geometry = feature.geometry as GeoJSON.Point | GeoJSON.LineString | GeoJSON.Polygon

      if (isPoint(geometry)) {
        bounds.extend(geometry.coordinates as [number, number])
        foundGeometry = true
      } else if (isLineString(geometry)) {
        geometry.coordinates.forEach((coord) => {
          bounds.extend(coord as [number, number])
          foundGeometry = true
        })
      } else if (isPolygon(geometry)) {
        geometry.coordinates.forEach((ring) => {
          ring.forEach((coord) => {
            bounds.extend(coord as [number, number])
            foundGeometry = true
          })
        })
      }
    })

    if (!bounds.isEmpty() && foundGeometry) {
      map.fitBounds(bounds, {
        padding: 50,
        maxZoom: 18,
        duration: 1000,
      })
      return
    }
  }

  // Fall back to location if geometries didn't work
  tryZoomToLocation(map, task)
}

const tryZoomToLocation = (map: maplibregl.Map, task: Task) => {
  if (!task.location) {
    return
  }

  try {
    const location =
      typeof task.location === 'string'
        ? (JSON.parse(task.location) as GeoJSON.Point)
        : task.location

    if (
      location.coordinates &&
      Array.isArray(location.coordinates) &&
      location.coordinates.length >= 2
    ) {
      const [lng, lat] = location.coordinates

      map.flyTo({
        center: [lng, lat],
        zoom: 15,
        duration: 1000,
      })
    }
  } catch (error) {
    console.error('Failed to parse location:', error)
  }
}
