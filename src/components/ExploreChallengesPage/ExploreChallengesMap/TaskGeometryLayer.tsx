import { useMemo } from 'react'
import { Layer, Source } from 'react-map-gl/maplibre'
import type { LayerProps } from 'react-map-gl/maplibre'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import type { PopupInfo } from './types'
import type { Task } from '@/types/Task'

// Layer styles for different geometry types
const fillLayer: LayerProps = {
  id: 'task-geometry-fill',
  type: 'fill',
  paint: {
    'fill-color': '#6366f1',
    'fill-opacity': 1,
  },
}

// Outline layer for polygons (drawn on top of fill)
const fillOutlineLayer: LayerProps = {
  id: 'task-geometry-fill-outline',
  type: 'line',
  paint: {
    'line-color': '#6366f1',
    'line-width': 4,
    'line-opacity': 1,
  },
}

const lineLayer: LayerProps = {
  id: 'task-geometry-line',
  type: 'line',
  paint: {
    'line-color': '#6366f1',
    'line-width': 4,
    'line-opacity': 1,
  },
}

const pointLayer: LayerProps = {
  id: 'task-geometry-point',
  type: 'circle',
  paint: {
    'circle-color': '#6366f1',
    'circle-radius': 6,
    'circle-stroke-width': 4,
    'circle-stroke-color': '#ffffff',
  },
}

/**
 * Extracts and normalizes geometries from a task
 */
const extractGeometries = (task: Task | null): GeoJSON.FeatureCollection | null => {
  if (!task?.geometries) return null

  try {
    const geometries =
      typeof task.geometries === 'string' ? JSON.parse(task.geometries) : task.geometries

    // If it's already a FeatureCollection, return it
    if (geometries.type === 'FeatureCollection' && geometries.features) {
      return geometries as GeoJSON.FeatureCollection
    }

    // If it's a single feature, wrap it in a FeatureCollection
    if (geometries.type === 'Feature') {
      return {
        type: 'FeatureCollection',
        features: [geometries],
      }
    }

    // If it's a geometry, wrap it in a feature
    if (geometries.type && geometries.coordinates) {
      return {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: geometries,
            properties: {},
          },
        ],
      }
    }

    return null
  } catch (error) {
    console.error('Failed to parse task geometries:', error)
    return null
  }
}

interface TaskGeometryLayerProps {
  popupInfo: PopupInfo
}

export const TaskGeometryLayer = ({ popupInfo }: TaskGeometryLayerProps) => {
  // For single popup, fetch the full task data to get geometries
  const singleTaskId = popupInfo?.type === 'single' ? popupInfo.task.id : null
  const { data: singleTask } = useQuery(
    singleTaskId ? api.task.getTask(singleTaskId) : ({ queryKey: ['task-geometry', 'disabled'], queryFn: async () => null as Task | null, enabled: false } as any)
  )

  // For overlap popups, fetch all tasks to get geometries
  const overlapTaskIds = popupInfo?.type === 'overlap' ? popupInfo.tasks.map((t) => t.id) : []
  const { data: overlapTasks } = useQuery(
    overlapTaskIds.length > 0
      ? api.task.getTasks(overlapTaskIds)
      : ({ queryKey: ['tasks-geometry', 'disabled'], queryFn: async () => [] as Task[], enabled: false } as any)
  )

  // Extract geometries based on popup type
  const geometries = useMemo(() => {
    if (!popupInfo) return null

    if (popupInfo.type === 'single') {
      const task = singleTask as Task | undefined
      return extractGeometries(task || null)
    }

    if (popupInfo.type === 'overlap') {
      const tasks = overlapTasks as Task[] | undefined
      if (tasks && Array.isArray(tasks) && tasks.length > 0) {
        // If a task is selected, show only that task's geometry
        // Otherwise, show geometries from all tasks
        const selectedTaskId = popupInfo.selectedTaskId
        const tasksToShow = selectedTaskId
          ? tasks.filter((task) => task.id === selectedTaskId)
          : tasks

        const allFeatures: GeoJSON.Feature[] = []
        
        for (const task of tasksToShow) {
          const taskGeometries = extractGeometries(task)
          if (taskGeometries && taskGeometries.features) {
            allFeatures.push(...taskGeometries.features)
          }
        }

        if (allFeatures.length > 0) {
          return {
            type: 'FeatureCollection' as const,
            features: allFeatures,
          }
        }
      }
    }

    return null
  }, [popupInfo, singleTask, overlapTasks])

  if (!geometries || geometries.features.length === 0) {
    return null
  }

  // Determine which layers we need based on geometry types
  const hasPolygon = geometries.features.some(
    (f) => f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'
  )
  const hasLineString = geometries.features.some(
    (f) => f.geometry.type === 'LineString' || f.geometry.type === 'MultiLineString'
  )
  const hasPoint = geometries.features.some(
    (f) => f.geometry.type === 'Point' || f.geometry.type === 'MultiPoint'
  )

  return (
    <Source id="task-geometry-source" type="geojson" data={geometries}>
      {hasPolygon && <Layer {...fillLayer} />}
      {hasPolygon && <Layer {...fillOutlineLayer} />}
      {hasLineString && <Layer {...lineLayer} />}
      {hasPoint && <Layer {...pointLayer} />}
    </Source>
  )
}

