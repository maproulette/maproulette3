import { useId, useMemo } from 'react'
import { Layer, Source } from 'react-map-gl/maplibre'
import { api } from '@/api'
import { useTaskBundleContext } from '@/components/Pages/TaskEditPage/contexts/TaskBundleContext'
import { useTaskContext } from '@/components/Pages/TaskEditPage/contexts/TaskContext'
import { useTaskMapContext } from '@/components/Pages/TaskEditPage/contexts/TaskMapContext'
import { logger } from '@/lib/logger'
import type { GeoJSONValue } from '@/types/geojson'
import type { Task } from '@/types/Task'

// Colors for geometry highlighting
const DEFAULT_COLOR = '#6366f1' // indigo
const SELECTED_COLOR = '#8b5cf6' // purple (matches marker highlight)

/**
 * Extracts and normalizes geometries from a task, adding taskId to properties
 */
const extractGeometries = (task: Task | null, taskId: number): GeoJSON.FeatureCollection | null => {
  if (!task?.geometries) return null

  try {
    const geometries = task.geometries as unknown as GeoJSONValue
    const addTaskId = (feature: GeoJSON.Feature): GeoJSON.Feature => ({
      ...feature,
      properties: {
        ...feature.properties,
        taskId,
      },
    })

    if (geometries.type === 'FeatureCollection') {
      return {
        type: 'FeatureCollection',
        features: geometries.features.map(addTaskId),
      }
    }

    if (geometries.type === 'Feature') {
      return {
        type: 'FeatureCollection',
        features: [addTaskId(geometries)],
      }
    }

    if ('coordinates' in geometries) {
      return {
        type: 'FeatureCollection',
        features: [
          addTaskId({
            type: 'Feature',
            geometry: geometries,
            properties: {},
          }),
        ],
      }
    }

    return null
  } catch (error) {
    logger.error('Failed to parse task geometries', { error: String(error) })
    return null
  }
}

/**
 * TaskGeometryLayer that always shows the primary task's geometries,
 * geometries for bundled tasks, and geometries for the selected marker
 */
export const TaskGeometryLayer = () => {
  const { selectedMarker } = useTaskMapContext()
  const { activeBundle } = useTaskBundleContext()
  const { task } = useTaskContext()
  const primaryTaskId = task.id

  const sourceId = useId()
  const layerId = useId()

  // Always fetch the primary task's geometries
  const { data: primaryTask } = api.task.getTask(primaryTaskId)

  // Fetch bundled task geometries (excluding primary task)
  const bundledTaskIds = activeBundle?.taskIds.filter((id) => id !== primaryTaskId) ?? []
  const { data: bundledTasks } = api.task.getTasks(bundledTaskIds)

  // Fetch selected marker task data if there's a marker selected
  const selectedTaskId = selectedMarker?.id ?? null
  const { data: selectedTask } = api.task.getTask(selectedTaskId ?? 0)

  const geometries = useMemo(() => {
    const allFeatures: GeoJSON.Feature[] = []

    // Always include primary task geometries
    const primaryGeometries = extractGeometries(primaryTask ?? null, primaryTaskId)
    if (primaryGeometries?.features) {
      allFeatures.push(...primaryGeometries.features)
    }

    // Always include bundled task geometries
    if (bundledTasks && Array.isArray(bundledTasks) && bundledTasks.length > 0) {
      for (const task of bundledTasks) {
        const taskGeometries = extractGeometries(task, task.id)
        if (taskGeometries?.features) {
          allFeatures.push(...taskGeometries.features)
        }
      }
    }

    // Add selected marker task geometries if it's different from primary and not already bundled
    if (
      selectedMarker &&
      selectedTask &&
      selectedTask.id !== primaryTaskId &&
      !activeBundle?.taskIds.includes(selectedTask.id)
    ) {
      const taskGeometries = extractGeometries(selectedTask, selectedTask.id)
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

    return null
  }, [selectedMarker, primaryTask, primaryTaskId, selectedTask, bundledTasks, activeBundle])

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

  // Create paint properties based on whether we have a selected task
  const getFillPaint = () => {
    if (selectedTaskId) {
      return {
        'fill-color': [
          'case',
          ['==', ['get', 'taskId'], selectedTaskId],
          SELECTED_COLOR,
          DEFAULT_COLOR,
        ],
        'fill-opacity': 0.3,
      }
    }
    return {
      'fill-color': DEFAULT_COLOR,
      'fill-opacity': 0.3,
    }
  }

  const getLinePaint = () => {
    if (selectedTaskId) {
      return {
        'line-color': [
          'case',
          ['==', ['get', 'taskId'], selectedTaskId],
          SELECTED_COLOR,
          DEFAULT_COLOR,
        ],
        'line-width': ['case', ['==', ['get', 'taskId'], selectedTaskId], 6, 4],
        'line-opacity': 1,
      }
    }
    return {
      'line-color': DEFAULT_COLOR,
      'line-width': 4,
      'line-opacity': 1,
    }
  }

  const getCirclePaint = () => {
    if (selectedTaskId) {
      return {
        'circle-color': [
          'case',
          ['==', ['get', 'taskId'], selectedTaskId],
          SELECTED_COLOR,
          DEFAULT_COLOR,
        ],
        'circle-radius': ['case', ['==', ['get', 'taskId'], selectedTaskId], 8, 6],
        'circle-stroke-width': 4,
        'circle-stroke-color': '#ffffff',
      }
    }
    return {
      'circle-color': DEFAULT_COLOR,
      'circle-radius': 6,
      'circle-stroke-width': 4,
      'circle-stroke-color': '#ffffff',
    }
  }

  return (
    <Source id={sourceId} type="geojson" data={geometries}>
      {hasPolygon && (
        <Layer
          id={`${layerId}-fill`}
          type="fill"
          paint={getFillPaint() as unknown as maplibregl.FillLayerSpecification['paint']}
        />
      )}
      {hasPolygon && (
        <Layer
          id={`${layerId}-fill-outline`}
          type="line"
          filter={['match', ['geometry-type'], ['Polygon', 'MultiPolygon'], true, false]}
          paint={getLinePaint() as unknown as maplibregl.LineLayerSpecification['paint']}
        />
      )}
      {hasLineString && (
        <Layer
          id={`${layerId}-line`}
          type="line"
          filter={['match', ['geometry-type'], ['LineString', 'MultiLineString'], true, false]}
          paint={getLinePaint() as unknown as maplibregl.LineLayerSpecification['paint']}
        />
      )}
      {hasPoint && (
        <Layer
          id={`${layerId}-point`}
          type="circle"
          paint={getCirclePaint() as unknown as maplibregl.CircleLayerSpecification['paint']}
        />
      )}
    </Source>
  )
}
