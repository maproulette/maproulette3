import maplibregl from 'maplibre-gl'
import { useEffect } from 'react'
import { useMapContext } from '@/contexts/MapContext'
import { useTaskContext } from '@/contexts/tasks/TaskContext'
import { isLineString, isPoint, isPolygon } from '@/utils/featureTypes'

export const TaskFeatures = () => {
  const { map, mapLoaded } = useMapContext()
  const { task } = useTaskContext()

  useEffect(() => {
    if (!map.current || !mapLoaded) return

    if (map.current.getSource('task-geometries')) {
      map.current.removeLayer('task-geometries')
      map.current.removeSource('task-geometries')
    }

    if (task.geometries && task.geometries.features.length > 0) {
      map.current.addSource('task-geometries', {
        type: 'geojson',
        data: task.geometries,
      })

      map.current.addLayer({
        id: 'task-geometries',
        type: 'circle',
        source: 'task-geometries',
        paint: {
          'circle-color': '#ff6b6b',
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      })

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
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 18,
        })
      } else if (task.location?.coordinates) {
        const [lng, lat] = task.location.coordinates
        map.current.setCenter([lng, lat])
        map.current.setZoom(15)
      }
    } else if (task.location?.coordinates) {
      const [lng, lat] = task.location.coordinates
      map.current.setCenter([lng, lat])
      map.current.setZoom(15)
    }
  }, [task, mapLoaded])

  return null
}
