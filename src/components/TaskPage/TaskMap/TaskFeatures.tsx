import { useEffect, useRef } from 'react'
import { useTaskContext } from '@/contexts/tasks/TaskContext'
import { useTaskMapContext } from '@/contexts/tasks/TaskMapContext'
import { zoomToTask } from './zoomToTask'

interface TaskFeaturesProps {
  dataLayerOrder?: ('task-features' | 'osm-data')[]
}

export const TaskFeatures = ({
  dataLayerOrder = ['task-features', 'osm-data'],
}: TaskFeaturesProps) => {
  const { map, mapLoaded } = useTaskMapContext()
  const { task } = useTaskContext()
  const hasZoomedRef = useRef(false)

  useEffect(() => {
    if (!map.current || !mapLoaded) return

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

      const taskFeaturesIndex = dataLayerOrder.indexOf('task-features')
      const osmDataIndex = dataLayerOrder.indexOf('osm-data')
      const taskFeaturesShouldBeOnTop = taskFeaturesIndex < osmDataIndex

      let beforeLayerId: string | undefined

      if (!taskFeaturesShouldBeOnTop) {
        const osmLayerIds = [
          'osm-data-area-fill',
          'osm-data-way-line',
          'osm-data-area-line',
          'osm-data-node',
        ]
        for (const osmLayerId of osmLayerIds) {
          const osmLayer = map.current.getLayer(osmLayerId)
          if (osmLayer) {
            beforeLayerId = osmLayerId
            break
          }
        }
      } else {
        const osmLayerIds = [
          'osm-data-node-highlight',
          'osm-data-way-highlight',
          'osm-data-area-highlight',
          'osm-data-area-highlight-fill',
          'osm-data-node',
          'osm-data-area-line',
          'osm-data-way-line',
          'osm-data-area-fill',
        ]
        for (const osmLayerId of osmLayerIds) {
          const osmLayer = map.current.getLayer(osmLayerId)
          if (osmLayer) {
            const style = map.current.getStyle()
            const layers = style.layers || []
            const osmLayerIndex = layers.findIndex((l) => l.id === osmLayerId)
            if (osmLayerIndex >= 0 && osmLayerIndex < layers.length - 1) {
              beforeLayerId = layers[osmLayerIndex + 1].id
              break
            }
          }
        }
      }

      const fillLayer = {
        id: 'task-geometries-fill',
        type: 'fill' as const,
        source: 'task-geometries',
        // biome-ignore lint/suspicious/noExplicitAny: MapLibre filter types are complex
        filter: ['==', ['geometry-type'], 'Polygon'] as any,
        paint: {
          'fill-color': '#3b82f6',
          'fill-opacity': 0.2,
        },
      }
      if (beforeLayerId) {
        // biome-ignore lint/suspicious/noExplicitAny: MapLibre AddLayerObject type is too strict
        map.current.addLayer(fillLayer as any, beforeLayerId)
      } else {
        // biome-ignore lint/suspicious/noExplicitAny: MapLibre AddLayerObject type is too strict
        map.current.addLayer(fillLayer as any)
      }

      const lineLayer = {
        id: 'task-geometries-line',
        type: 'line' as const,
        source: 'task-geometries',
        // biome-ignore lint/suspicious/noExplicitAny: MapLibre filter types are complex
        filter: ['in', ['geometry-type'], ['literal', ['LineString', 'Polygon']]] as any,
        paint: {
          'line-color': '#3b82f6',
          'line-width': 3,
        },
      }
      if (beforeLayerId) {
        // biome-ignore lint/suspicious/noExplicitAny: MapLibre AddLayerObject type is too strict
        map.current.addLayer(lineLayer as any, beforeLayerId)
      } else {
        // biome-ignore lint/suspicious/noExplicitAny: MapLibre AddLayerObject type is too strict
        map.current.addLayer(lineLayer as any)
      }

      const outlineLayer = {
        id: 'task-geometries-outline',
        type: 'line' as const,
        source: 'task-geometries',
        // biome-ignore lint/suspicious/noExplicitAny: MapLibre filter types are complex
        filter: ['in', ['geometry-type'], ['literal', ['LineString', 'Polygon']]] as any,
        paint: {
          'line-color': '#ffffff',
          'line-width': 5,
          'line-opacity': 0.5,
        },
      }
      if (beforeLayerId) {
        // biome-ignore lint/suspicious/noExplicitAny: MapLibre AddLayerObject type is too strict
        map.current.addLayer(outlineLayer as any, beforeLayerId)
      } else {
        // biome-ignore lint/suspicious/noExplicitAny: MapLibre AddLayerObject type is too strict
        map.current.addLayer(outlineLayer as any)
      }

      const pointLayer = {
        id: 'task-geometries-point',
        type: 'circle' as const,
        source: 'task-geometries',
        // biome-ignore lint/suspicious/noExplicitAny: MapLibre filter types are complex
        filter: ['==', ['geometry-type'], 'Point'] as any,
        paint: {
          'circle-color': '#3b82f6',
          'circle-radius': 8,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
        },
      }
      if (beforeLayerId) {
        // biome-ignore lint/suspicious/noExplicitAny: MapLibre AddLayerObject type is too strict
        map.current.addLayer(pointLayer as any, beforeLayerId)
      } else {
        // biome-ignore lint/suspicious/noExplicitAny: MapLibre AddLayerObject type is too strict
        map.current.addLayer(pointLayer as any)
      }

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

    const taskFeatureLayerIds = [
      'task-geometries-fill',
      'task-geometries-line',
      'task-geometries-outline',
      'task-geometries-point',
    ]
    const existingLayers = taskFeatureLayerIds.filter((id) => map.current?.getLayer(id))

    if (existingLayers.length > 0) {
      const taskFeaturesIndex = dataLayerOrder.indexOf('task-features')
      const osmDataIndex = dataLayerOrder.indexOf('osm-data')
      const taskFeaturesShouldBeOnTop = taskFeaturesIndex < osmDataIndex

      let targetBeforeLayerId: string | undefined

      if (!taskFeaturesShouldBeOnTop) {
        const osmLayerIds = [
          'osm-data-area-fill',
          'osm-data-way-line',
          'osm-data-area-line',
          'osm-data-node',
        ]
        for (const osmLayerId of osmLayerIds) {
          const osmLayer = map.current.getLayer(osmLayerId)
          if (osmLayer) {
            targetBeforeLayerId = osmLayerId
            break
          }
        }
      } else {
        const osmLayerIds = [
          'osm-data-node-highlight',
          'osm-data-way-highlight',
          'osm-data-area-highlight',
          'osm-data-area-highlight-fill',
          'osm-data-node',
          'osm-data-area-line',
          'osm-data-way-line',
          'osm-data-area-fill',
        ]
        for (const osmLayerId of osmLayerIds) {
          const osmLayer = map.current.getLayer(osmLayerId)
          if (osmLayer) {
            const style = map.current.getStyle()
            const layers = style.layers || []
            const osmLayerIndex = layers.findIndex((l) => l.id === osmLayerId)
            if (osmLayerIndex >= 0 && osmLayerIndex < layers.length - 1) {
              targetBeforeLayerId = layers[osmLayerIndex + 1].id
              break
            }
          }
        }
      }

      if (targetBeforeLayerId) {
        existingLayers.reverse().forEach((layerId) => {
          if (map.current?.getLayer(layerId)) {
            try {
              map.current.moveLayer(layerId, targetBeforeLayerId)
            } catch (error) {
              console.warn(`Failed to move layer ${layerId}:`, error)
            }
          }
        })
      }
    }

    if (!hasZoomedRef.current && task.id) {
      zoomToTask(map.current, task)
      hasZoomedRef.current = true
    }
  }, [task, mapLoaded, map, dataLayerOrder])

  useEffect(() => {
    hasZoomedRef.current = false
  }, [task.id])

  return null
}
