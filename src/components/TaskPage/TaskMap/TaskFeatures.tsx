import { useEffect } from 'react'
import { useMapContext } from '@/contexts/MapContext'
import { useTaskContext } from '@/contexts/tasks/TaskContext'
import { zoomToTask } from './zoomToTask'

export const TaskFeatures = () => {
  const { map, mapLoaded } = useMapContext()
  const { task } = useTaskContext()

  useEffect(() => {
    if (!map.current || !mapLoaded) return

    if (map.current.getSource('task-geometries')) {
      map.current.removeLayer('task-geometries')
      map.current.removeSource('task-geometries')
    }

    if (task.geometries && typeof task.geometries === 'string' && task.geometries.length > 0) {
      let parsedGeometries: GeoJSON.FeatureCollection
      try {
        parsedGeometries = JSON.parse(task.geometries)
      } catch (error) {
        console.error('Failed to parse geometries:', error)
        return
      }

      map.current.addSource('task-geometries', {
        type: 'geojson',
        data: parsedGeometries,
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
    }

    // Zoom to task on initial load
    zoomToTask(map.current, task)
  }, [task, mapLoaded])

  return null
}
