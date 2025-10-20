import maplibregl from 'maplibre-gl'
import type { Task } from '@/types/Task'
import { isLineString, isPoint, isPolygon } from '@/utils/featureTypes'

export const zoomToTask = (map: maplibregl.Map, task: Task) => {
  if (task.geometries && task.geometries.features.length > 0) {
    const bounds = new maplibregl.LngLatBounds()

    task.geometries.features.forEach((feature) => {
      if (isPoint(feature.geometry)) {
        bounds.extend(feature.geometry.coordinates)
      } else if (isLineString(feature.geometry)) {
        feature.geometry.coordinates.forEach((coord) => {
          bounds.extend(coord)
        })
      } else if (isPolygon(feature.geometry)) {
        feature.geometry.coordinates.forEach((ring) => {
          ring.forEach((coord) => {
            bounds.extend(coord)
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
    } else if (task.location?.coordinates) {
      const [lng, lat] = task.location.coordinates
      map.flyTo({
        center: [lng, lat],
        zoom: 15,
        duration: 1000,
      })
    }
  } else if (task.location?.coordinates) {
    const [lng, lat] = task.location.coordinates
    map.flyTo({
      center: [lng, lat],
      zoom: 15,
      duration: 1000,
    })
  }
}

