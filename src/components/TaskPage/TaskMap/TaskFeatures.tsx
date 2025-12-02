import { useEffect } from 'react'
import { useMapContext } from '@/contexts/MapContext'
import { useTaskContext } from '@/contexts/tasks/TaskContext'
import { zoomToTask } from './zoomToTask'

export const TaskFeatures = () => {
  const { map, mapLoaded } = useMapContext()
  const { task } = useTaskContext()

  useEffect(() => {
    if (!map.current || !mapLoaded) return

    // Clean up existing layers
    const layersToRemove = [
      'task-geometries-fill',
      'task-geometries-line',
      'task-geometries-outline',
      'task-geometries-point',
    ]

    layersToRemove.forEach((layerId) => {
      if (map.current?.getLayer(layerId)) {
        map.current.removeLayer(layerId)
      }
    })

    if (map.current.getSource('task-geometries')) {
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

      // Add polygon fill layer
      map.current.addLayer({
        id: 'task-geometries-fill',
        type: 'fill',
        source: 'task-geometries',
        filter: ['==', ['geometry-type'], 'Polygon'],
        paint: {
          'fill-color': '#3b82f6',
          'fill-opacity': 0.2,
        },
      })

      // Add line layer for LineStrings and Polygon outlines
      map.current.addLayer({
        id: 'task-geometries-line',
        type: 'line',
        source: 'task-geometries',
        filter: ['in', ['geometry-type'], ['literal', ['LineString', 'Polygon']]],
        paint: {
          'line-color': '#3b82f6',
          'line-width': 3,
        },
      })

      // Add outline for better visibility
      map.current.addLayer({
        id: 'task-geometries-outline',
        type: 'line',
        source: 'task-geometries',
        filter: ['in', ['geometry-type'], ['literal', ['LineString', 'Polygon']]],
        paint: {
          'line-color': '#ffffff',
          'line-width': 5,
          'line-opacity': 0.5,
        },
      })

      // Add point layer
      map.current.addLayer({
        id: 'task-geometries-point',
        type: 'circle',
        source: 'task-geometries',
        filter: ['==', ['geometry-type'], 'Point'],
        paint: {
          'circle-color': '#3b82f6',
          'circle-radius': 8,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
        },
      })

      // Move layers to ensure proper ordering (below labels, above other features)
      const firstLabelLayer = map.current
        .getStyle()
        .layers?.find((layer) => layer.type === 'symbol')?.id

      if (firstLabelLayer) {
        layersToRemove.reverse().forEach((layerId) => {
          if (map.current?.getLayer(layerId)) {
            map.current.moveLayer(layerId, firstLabelLayer)
          }
        })
      }
    }

    // Zoom to task on initial load
    zoomToTask(map.current, task)
  }, [task, mapLoaded, map])

  return null
}
