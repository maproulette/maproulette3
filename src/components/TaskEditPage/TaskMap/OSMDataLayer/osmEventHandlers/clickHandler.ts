import type maplibregl from 'maplibre-gl'
import { Popup } from 'maplibre-gl'
import maplibreglLib from 'maplibre-gl'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { OverlapPopup, SingleTaskPopup } from '@/components/OverlapedMarkersPopup'
import type { TaskMarker, Task, TaskGetResponse } from '@/types/Task'
import { apiRequest } from '@/api'
import { createPopupContent } from '../osmPopup'
import type { EventHandlerContext } from './types'
import { getFeatureId, isValidOSMFeature } from './utils'

// Duplicated from shared TaskMarkers/const
const LAYER_IDS = {
  source: 'task-markers',
  clusters: 'task-clusters',
  clusterCount: 'task-cluster-count',
  points: 'task-unclustered-point',
}

const CLUSTER_CONFIG = {
  maxZoom: 14,
  radius: 50,
  colors: ['#22c55e', '#eab308', '#f97316'],
  sizes: [20, 25, 30],
  steps: [30, 70],
}

// Duplicated popup utilities from shared TaskMarkers/utils/popupUtils
const POPUP_OFFSET = {
  top: [0, 0] as [number, number],
  'top-left': [0, 0] as [number, number],
  'top-right': [0, 0] as [number, number],
  bottom: [0, -32] as [number, number],
  'bottom-left': [0, -32] as [number, number],
  'bottom-right': [0, -32] as [number, number],
  left: [0, 0] as [number, number],
  right: [0, 0] as [number, number],
} as maplibregl.Offset

const POPUP_CONFIG = {
  closeOnClick: true,
  closeButton: false,
  maxWidth: '320px',
  className: 'task-marker-popup',
  offset: POPUP_OFFSET,
} as const

const removeAllPopups = (_map: maplibregl.Map) => {
  const existingPopups = document.querySelectorAll('.maplibregl-popup')
  existingPopups.forEach((popup) => {
    popup.remove()
  })
}

const extractTaskMarkersFromFeatures = (
  features: GeoJSON.Feature[],
  overlapId: string
): TaskMarker[] => {
  const uniqueTasksMap = new Map<string, TaskMarker>()

  features
    .filter((f) => f.properties?.overlapId === overlapId)
    .forEach((f) => {
      const taskId = String(f.properties?.id)
      if (!uniqueTasksMap.has(taskId)) {
        const geometry = f.geometry as GeoJSON.Point
        uniqueTasksMap.set(taskId, {
          id: Number(taskId),
          status: Number(f.properties?.status ?? 0),
          priority: Number(f.properties?.priority ?? 0),
          location: {
            lng: geometry.coordinates[0],
            lat: geometry.coordinates[1],
          },
        })
      }
    })

  return Array.from(uniqueTasksMap.values())
}

const showOverlapPopup = (
  map: maplibregl.Map,
  coordinates: [number, number],
  tasks: TaskMarker[]
) => {
  removeAllPopups(map)

  const popupContainer = document.createElement('div')
  const popup = new maplibreglLib.Popup({
    ...POPUP_CONFIG,
    maxWidth: '320px',
  })
    .setLngLat(coordinates)
    .setDOMContent(popupContainer)
    .addTo(map)

  requestAnimationFrame(() => {
    if (map && popup.isOpen()) {
      popup.setLngLat(coordinates)
    }
  })

  const handleClose = () => {
    popup.remove()
  }

  const root = createRoot(popupContainer)
  root.render(React.createElement(OverlapPopup, { tasks, onClose: handleClose }))

  popup.on('close', () => {
    root.unmount()
  })

  return popup
}

const showSingleTaskPopup = async (
  map: maplibregl.Map,
  coordinates: [number, number],
  task: TaskMarker
) => {
  // Fetch task data before creating the popup
  let taskData: Task | undefined
  try {
    // Fetch task data directly using apiRequest (same as queryFn does)
    const response = await apiRequest
      .get(`api/v2/task/${task.id}?mapillary=false`)
      .json<TaskGetResponse>()
    taskData = response
  } catch (error) {
    console.error('Error fetching task data:', error)
    // Continue to show popup even if fetch fails - it will handle the error state
  }

  removeAllPopups(map)

  const popupContainer = document.createElement('div')
  const popup = new maplibreglLib.Popup({
    ...POPUP_CONFIG,
    maxWidth: '260px',
  })
    .setLngLat(coordinates)
    .setDOMContent(popupContainer)
    .addTo(map)

  requestAnimationFrame(() => {
    if (map && popup.isOpen()) {
      popup.setLngLat(coordinates)
    }
  })

  const handleClose = () => {
    popup.remove()
  }

  const root = createRoot(popupContainer)
  root.render(React.createElement(SingleTaskPopup, { taskId: task.id, map, onClose: handleClose, initialTaskData: taskData }))

  popup.on('close', () => {
    root.unmount()
  })

  return popup
}

// Duplicated from shared TaskMarkers/eventListeners
const isGeoJSONSource = (source: maplibregl.Source): source is maplibregl.GeoJSONSource => {
  return source.type === 'geojson'
}

const handleClusterClick = async (
  map: React.RefObject<maplibregl.Map | null>,
  e: maplibregl.MapMouseEvent,
  sourceId: string = LAYER_IDS.source
) => {
  if (!map.current) return

  const clusterLayerId = LAYER_IDS.clusters
  const clusterLayer = map.current.getLayer(clusterLayerId)

  const clusterLayerIds = clusterLayer
    ? [clusterLayerId]
    : (() => {
        const style = map.current.getStyle()
        return (
          style?.layers
            ?.filter((layer) => layer.id.includes('task-clusters'))
            .map((layer) => layer.id) || []
        )
      })()

  if (clusterLayerIds.length === 0) return

  const features = map.current.queryRenderedFeatures(e.point, {
    layers: clusterLayerIds,
  })

  if (!features || features.length === 0) return

  const clusterFeature = features.find(
    (f) => f.layer?.id === clusterLayerId || f.layer?.id?.includes('task-clusters')
  )

  if (!clusterFeature) return

  const geometry = clusterFeature.geometry
  if (!geometry || geometry.type !== 'Point') return

  const coords = geometry.coordinates as number[]
  if (!coords || coords.length < 2) return

  const lng = Number(coords[0])
  const lat = Number(coords[1])

  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    console.error('Invalid coordinates:', coords)
    return
  }

  const clusterScreenPoint = map.current.project([lng, lat])
  const clickPoint = e.point

  const distance = Math.sqrt(
    (clickPoint.x - clusterScreenPoint.x) ** 2 + (clickPoint.y - clusterScreenPoint.y) ** 2
  )

  const pointCount =
    clusterFeature.properties?.point_count || clusterFeature.properties?.taskCount || 0
  let clusterRadius = CLUSTER_CONFIG.sizes[0]
  if (pointCount >= CLUSTER_CONFIG.steps[1]) {
    clusterRadius = CLUSTER_CONFIG.sizes[2]
  } else if (pointCount >= CLUSTER_CONFIG.steps[0]) {
    clusterRadius = CLUSTER_CONFIG.sizes[1]
  }

  if (distance > clusterRadius * 1.2) {
    return
  }

  const clusterId = clusterFeature.properties?.cluster_id
  const source = map.current.getSource(sourceId)
  if (!source || !isGeoJSONSource(source)) return

  // @ts-expect-error - MapLibre doesn't expose cluster property in types
  const hasClientSideClustering = source.cluster === true

  if (hasClientSideClustering && clusterId !== undefined) {
    try {
      const zoom = await source.getClusterExpansionZoom(clusterId)
      if (Number.isFinite(zoom) && map.current) {
        map.current.easeTo({
          center: [lng, lat],
          zoom,
        })
      }
    } catch (error) {
      console.error('Error getting cluster expansion zoom:', error)

      const currentZoom = map.current.getZoom()
      map.current.easeTo({
        center: [lng, lat],
        zoom: currentZoom + 2,
      })
    }
  } else {
    const currentZoom = map.current.getZoom()
    map.current.easeTo({
      center: [lng, lat],
      zoom: currentZoom + 2,
    })
  }
}

const handleMarkerClick = (
  map: React.RefObject<maplibregl.Map | null>,
  e: maplibregl.MapMouseEvent | maplibregl.MapLayerMouseEvent,
  sourceId: string = LAYER_IDS.source
) => {
  if (!map.current) {
    return
  }

  const pointLayerId = LAYER_IDS.points
  const pointLayer = map.current.getLayer(pointLayerId)

  const pointLayerIds = pointLayer
    ? [pointLayerId]
    : (() => {
        const style = map.current.getStyle()
        return (
          style?.layers
            ?.filter(
              (layer) =>
                layer.id.includes('task-unclustered-point') ||
                layer.id.includes('task-markers-points')
            )
            .map((layer) => layer.id) || []
        )
      })()

  let feature: GeoJSON.Feature | undefined

  if ('features' in e && e.features && e.features.length > 0) {
    feature = e.features[0] as GeoJSON.Feature
  } else {
    const features = map.current.queryRenderedFeatures(e.point, {
      layers: pointLayerIds.length > 0 ? pointLayerIds : undefined,
    })
    feature = features[0] as GeoJSON.Feature | undefined
  }

  if (!feature) {
    return
  }

  const { id, status, isOverlapping, overlapId } = feature.properties || {}

  const coordinates =
    feature.geometry && feature.geometry.type === 'Point'
      ? (feature.geometry.coordinates as [number, number])
      : null

  if (!coordinates) return

  if (isOverlapping && overlapId) {
    const allFeatures = map.current.querySourceFeatures(sourceId, {
      filter: ['==', ['get', 'overlapId'], overlapId],
    })

    const overlappingTasks = extractTaskMarkersFromFeatures(allFeatures, overlapId)

    showOverlapPopup(map.current, coordinates, overlappingTasks)
  } else {
    const task: TaskMarker = {
      id: Number(id),
      status: Number(status),
      priority: Number(feature.properties?.priority ?? 0),
      location: { lng: coordinates[0], lat: coordinates[1] },
    }

    console.log('handleMarkerClick: Showing single task popup', task)
    showSingleTaskPopup(map.current, coordinates, task).catch((error) => {
      console.error('Error showing task popup:', error)
    })
  }
}

export const createMapClickHandler = (context: EventHandlerContext) => {
  const {
    map,
    sourceId,
    layersRef,
    currentPopupRef,
    highlightedFeatureIdsRef,
    hoveredFeatureIdsRef,
  } = context

  return (e: maplibregl.MapMouseEvent) => {
    if (!map.current) return

    hoveredFeatureIdsRef.current.forEach((featureId) => {
      try {
        map.current?.setFeatureState({ source: sourceId, id: featureId }, { hover: false })
      } catch {}
    })
    hoveredFeatureIdsRef.current.clear()

    const taskMarkerLayerIds = [
      LAYER_IDS.points,
      LAYER_IDS.clusters,
      LAYER_IDS.clusterCount,
    ].filter((id) => {
      const layer = map.current?.getLayer(id)
      if (!layer) return false
      const layout = layer.layout as { visibility?: string } | undefined
      return layout?.visibility !== 'none'
    })

    if (taskMarkerLayerIds.length > 0) {
      const taskMarkerFeatures = map.current.queryRenderedFeatures(e.point, {
        layers: taskMarkerLayerIds,
      })
      if (taskMarkerFeatures && taskMarkerFeatures.length > 0) {
        const clickedFeature = taskMarkerFeatures[0]
        const layerId = clickedFeature.layer?.id

        if (layerId === LAYER_IDS.clusters || layerId?.includes('cluster')) {
          const clusterFeature = taskMarkerFeatures.find(
            (f) => f.layer?.id === LAYER_IDS.clusters || f.layer?.id?.includes('task-clusters')
          )
          if (clusterFeature) {
            handleClusterClick(map, e, LAYER_IDS.source)
          }

          return
        } else {
          handleMarkerClick(map, e, LAYER_IDS.source)
        }

        return
      }
    }

    const osmLayerIds = layersRef.current.filter((id) => !id.includes('-highlight'))
    const osmFeatures =
      osmLayerIds.length > 0
        ? map.current.queryRenderedFeatures(e.point, {
            layers: osmLayerIds,
          })
        : []

    const validOSMFeatures = osmFeatures.filter(isValidOSMFeature)
    const uniqueFeatures = new Map<string, GeoJSON.Feature>()
    validOSMFeatures.forEach((feature) => {
      const featureId = getFeatureId(feature)
      if (featureId && !uniqueFeatures.has(featureId)) {
        uniqueFeatures.set(featureId, feature)
      }
    })
    const deduplicatedFeatures = Array.from(uniqueFeatures.values())

    if (deduplicatedFeatures.length > 0) {
      const clickedFeatureIds = new Set<string>()
      deduplicatedFeatures.forEach((feature) => {
        const featureId = getFeatureId(feature)
        if (featureId) {
          clickedFeatureIds.add(featureId)
        }
      })

      const isSameSelection =
        clickedFeatureIds.size > 0 &&
        clickedFeatureIds.size === highlightedFeatureIdsRef.current.size &&
        Array.from(clickedFeatureIds).every((id) => highlightedFeatureIdsRef.current.has(id))

      if (isSameSelection && currentPopupRef.current) {
        currentPopupRef.current.remove()
        currentPopupRef.current = null

        highlightedFeatureIdsRef.current.forEach((featureId) => {
          try {
            map.current?.setFeatureState(
              { source: sourceId, id: featureId },
              { hover: false, selected: false }
            )
          } catch {}
        })
        highlightedFeatureIdsRef.current.clear()
        return
      }

      highlightedFeatureIdsRef.current.forEach((featureId) => {
        if (!clickedFeatureIds.has(featureId)) {
          try {
            map.current?.setFeatureState(
              { source: sourceId, id: featureId },
              { hover: false, selected: false }
            )
          } catch {}
        }
      })

      if (currentPopupRef.current) {
        currentPopupRef.current.remove()
        currentPopupRef.current = null
      }

      clickedFeatureIds.forEach((featureId) => {
        if (map.current) {
          try {
            map.current.setFeatureState(
              { source: sourceId, id: featureId },
              { hover: true, selected: true }
            )
          } catch {}
        }
      })
      highlightedFeatureIdsRef.current = clickedFeatureIds

      const popupContent = createPopupContent(deduplicatedFeatures)
      currentPopupRef.current = new Popup({
        closeOnClick: true,
        closeButton: true,
        maxWidth: '400px',
      })
        .setLngLat(e.lngLat)
        .setDOMContent(popupContent)
        .addTo(map.current)

      currentPopupRef.current.on('close', () => {
        highlightedFeatureIdsRef.current.forEach((featureId) => {
          try {
            map.current?.setFeatureState(
              { source: sourceId, id: featureId },
              { hover: false, selected: false }
            )
          } catch {}
        })
        highlightedFeatureIdsRef.current.clear()
        currentPopupRef.current = null
      })
      return
    }

    highlightedFeatureIdsRef.current.forEach((featureId) => {
      try {
        map.current?.setFeatureState(
          { source: sourceId, id: featureId },
          { hover: false, selected: false }
        )
      } catch {}
    })
    highlightedFeatureIdsRef.current.clear()

    if (currentPopupRef.current) {
      currentPopupRef.current.remove()
      currentPopupRef.current = null
    }
  }
}
