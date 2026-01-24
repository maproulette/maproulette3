import { useId, useMemo } from 'react'
import type { LayerProps } from 'react-map-gl/maplibre'
import { Layer, Source } from 'react-map-gl/maplibre'
import { api } from '@/api'
import type { Task } from '@/types/Task'
import type { PopupInfo } from './types'

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

    if (geometries.type === 'FeatureCollection' && geometries.features) {
      return geometries as GeoJSON.FeatureCollection
    }

    if (geometries.type === 'Feature') {
      return {
        type: 'FeatureCollection',
        features: [geometries],
      }
    }

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
  const sourceId = useId()
  const singleTaskId = popupInfo?.type === 'single' ? popupInfo.task.id : null

  const { data: singleTask } = api.task.getTask(singleTaskId as number)

  const overlapTaskIds = popupInfo?.type === 'overlap' ? popupInfo.tasks.map((t) => t.id) : []

  const { data: overlapTasks } = api.task.getTasks(overlapTaskIds)

  const geometries = useMemo(() => {
    if (!popupInfo) return null

    if (popupInfo.type === 'single') {
      const task = singleTask as Task | undefined
      return extractGeometries(task || null)
    }

    if (popupInfo.type === 'overlap') {
      const tasks = overlapTasks as Task[] | undefined
      if (tasks && Array.isArray(tasks) && tasks.length > 0) {
        const selectedTaskId = popupInfo.selectedTaskId
        const tasksToShow = selectedTaskId
          ? tasks.filter((task) => task.id === selectedTaskId)
          : tasks

        const allFeatures: GeoJSON.Feature[] = []

        for (const task of tasksToShow) {
          const taskGeometries = extractGeometries(task)
          if (taskGeometries?.features) {
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
    <Source id={sourceId} type="geojson" data={geometries}>
      {hasPolygon && <Layer {...fillLayer} />}
      {hasPolygon && <Layer {...fillOutlineLayer} />}
      {hasLineString && <Layer {...lineLayer} />}
      {hasPoint && <Layer {...pointLayer} />}
    </Source>
  )
}
