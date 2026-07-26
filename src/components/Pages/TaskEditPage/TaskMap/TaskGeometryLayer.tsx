import { useId, useMemo } from 'react'
import { Layer, Source } from 'react-map-gl/maplibre'
import { api } from '@/api'
import { useTaskBundleContext } from '@/components/Pages/TaskEditPage/contexts/TaskBundleContext'
import { useTaskContext } from '@/components/Pages/TaskEditPage/contexts/TaskContext'
import { useTaskMapContext } from '@/components/Pages/TaskEditPage/contexts/TaskMapContext'
import { decorateTaskFeatures } from '@/lib/decorateTaskFeatures'

// Colors for geometry highlighting
const DEFAULT_COLOR = '#6366f1' // indigo
const SELECTED_COLOR = '#8b5cf6' // purple (matches marker highlight)

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

    if (primaryTask) {
      allFeatures.push(...decorateTaskFeatures(primaryTask).features)
    }

    if (bundledTasks) {
      for (const task of bundledTasks) {
        allFeatures.push(...decorateTaskFeatures(task).features)
      }
    }

    if (
      selectedMarker &&
      selectedTask &&
      selectedTask.id !== primaryTaskId &&
      !activeBundle?.taskIds.includes(selectedTask.id)
    ) {
      allFeatures.push(...decorateTaskFeatures(selectedTask).features)
    }

    if (allFeatures.length === 0) return null
    return { type: 'FeatureCollection' as const, features: allFeatures }
  }, [selectedMarker, primaryTask, primaryTaskId, selectedTask, bundledTasks, activeBundle])

  if (!geometries) {
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
          paint={getFillPaint() as maplibregl.FillLayerSpecification['paint']}
        />
      )}
      {hasPolygon && (
        <Layer
          id={`${layerId}-fill-outline`}
          type="line"
          filter={['match', ['geometry-type'], ['Polygon', 'MultiPolygon'], true, false]}
          paint={getLinePaint() as maplibregl.LineLayerSpecification['paint']}
        />
      )}
      {hasLineString && (
        <Layer
          id={`${layerId}-line`}
          type="line"
          filter={['match', ['geometry-type'], ['LineString', 'MultiLineString'], true, false]}
          paint={getLinePaint() as maplibregl.LineLayerSpecification['paint']}
        />
      )}
      {hasPoint && (
        <Layer
          id={`${layerId}-point`}
          type="circle"
          paint={getCirclePaint() as maplibregl.CircleLayerSpecification['paint']}
        />
      )}
    </Source>
  )
}
