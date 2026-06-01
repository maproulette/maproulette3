import { useId, useMemo } from 'react'
import type { LayerProps } from 'react-map-gl/maplibre'
import { Layer, Source } from 'react-map-gl/maplibre'
import { api } from '@/api'
import { logger } from '@/lib/logger'
import type { Task } from '@/types/Task'

// Layer styles for different geometry types
const fillLayer: LayerProps = {
  id: 'task-geometry-fill',
  type: 'fill',
  paint: {
    'fill-color': '#6366f1',
    'fill-opacity': 0.15,
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
  filter: ['match', ['geometry-type'], ['Point', 'MultiPoint'], true, false],
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
    const { geometries } = task
    if (geometries.type === 'FeatureCollection') {
      return geometries
    }

    if (geometries.type === 'Feature') {
      return {
        type: 'FeatureCollection',
        features: [geometries],
      }
    }

    if ('coordinates' in geometries) {
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
    logger.error('Failed to parse task geometries', { error })
    return null
  }
}

interface TaskGeometryLayerProps {
  selectedTaskId: number | null
}

export const TaskGeometryLayer = ({ selectedTaskId }: TaskGeometryLayerProps) => {
  const sourceId = useId()
  const { data: taskData } = api.task.getTask(selectedTaskId as number)

  // Reason: Avoids re-parsing task geometries on every render when task data hasn't changed
  const geometries = useMemo(() => {
    if (!selectedTaskId) return null

    const task = taskData as Task | undefined
    return extractGeometries(task || null)
  }, [selectedTaskId, taskData])

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
