import maplibregl from 'maplibre-gl'
import type { Task } from '@/types/Task'
import { isLineString, isPoint, isPolygon } from '@/utils/featureTypes'

export const zoomToTask = (map: maplibregl.Map, task: Task) => {
  if (task.geometries && typeof task.geometries === 'string' && task.geometries.length > 0) {
    let parsedGeometries: GeoJSON.FeatureCollection
    try {
      parsedGeometries = JSON.parse(task.geometries)
    } catch (error) {
      console.error('Failed to parse geometries:', error)
      return
    }

    const bounds = new maplibregl.LngLatBounds()

    parsedGeometries.features.forEach((feature: GeoJSON.Feature) => {
      if (!feature.geometry) return

      const geometry = feature.geometry as GeoJSON.Point | GeoJSON.LineString | GeoJSON.Polygon

      if (isPoint(geometry)) {
        bounds.extend(geometry.coordinates as [number, number])
      } else if (isLineString(geometry)) {
        geometry.coordinates.forEach((coord) => {
          bounds.extend(coord as [number, number])
        })
      } else if (isPolygon(geometry)) {
        geometry.coordinates.forEach((ring) => {
          ring.forEach((coord) => {
            bounds.extend(coord as [number, number])
          })
        })
      }
    })

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, {
        padding: 50,
        maxZoom: 18,
        duration: 1000,
      })
    } else if (task.location && typeof task.location === 'string') {
      try {
        const location = JSON.parse(task.location) as GeoJSON.Point
        if (location.coordinates) {
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
  } else if (task.location && typeof task.location === 'string') {
    try {
      const location = JSON.parse(task.location) as GeoJSON.Point
      if (location.coordinates) {
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
}
