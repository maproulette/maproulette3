import { useCallback } from 'react'
import type { MapMouseEvent } from 'react-map-gl/maplibre'
import type Supercluster from 'supercluster'
import { flyToClusterExpansion } from '@/components/Map/TaskMarkers/clusterUtils'
import { LAYER_IDS } from '@/components/Map/TaskMarkers/const'
import { createSpiderGroup, detectVisualOverlaps } from '@/components/Map/TaskMarkers/spiderUtils'
import { useTaskContext } from '@/components/Pages/TaskEditPage/contexts/TaskContext'
import { useTaskMapContext } from '@/components/Pages/TaskEditPage/contexts/TaskMapContext'
import type { TaskMarker } from '@/types/Task'
import type {
  ClusterProperties,
  OverlapGroupsMap,
  PointProperties,
  SpideredMarkers,
} from './taskEditMapTypes'

interface MarkersData {
  markers: TaskMarker[]
}

/**
 * Builds the map's click and mouse-move handlers: resolving a click on a
 * spidered marker, an overlap marker, a client-side cluster, or a plain
 * unclustered point into the right selection/spidering state, and setting the
 * hover cursor. Both handlers are gated on lasso `drawingMode` — while drawing
 * a lasso selection, clicks/moves are handled by the lasso layer instead.
 */
export const useTaskMapInteractions = (
  markersData: MarkersData,
  overlapGroupsMap: OverlapGroupsMap,
  superclusterRef: React.RefObject<Supercluster<PointProperties, ClusterProperties> | null>,
  setSpideredMarkers: React.Dispatch<React.SetStateAction<SpideredMarkers>>,
  shouldCluster: boolean
) => {
  const { map: mapRef, drawingMode, setSelectedMarker, triggerEmptyClick } = useTaskMapContext()
  const { task } = useTaskContext()
  const primaryTaskId = task.id

  const handleMapClick = useCallback(
    async (e: MapMouseEvent) => {
      if (!e.features || e.features.length === 0) {
        setSpideredMarkers(new Map())
        setSelectedMarker(null)
        triggerEmptyClick()
        return
      }

      const feature = e.features[0]
      if (!feature) {
        setSpideredMarkers(new Map())
        setSelectedMarker(null)
        triggerEmptyClick()
        return
      }

      if (!mapRef.current) return

      const map = mapRef.current.getMap()
      if (!map) return

      const isSpideredMarker =
        feature.layer?.id === 'spidered-markers-layer' &&
        feature.properties?.id !== undefined &&
        feature.geometry.type === 'Point'

      if (isSpideredMarker) {
        const taskId = feature.properties.id as number

        let task = markersData.markers.find((m) => m.id === taskId)
        if (!task) {
          for (const overlapGroup of overlapGroupsMap.values()) {
            const overlapTask = overlapGroup.tasks.find((t) => t.id === taskId)
            if (overlapTask) {
              task = overlapTask
              break
            }
          }
        }
        if (task && task.id !== primaryTaskId) {
          setSelectedMarker(task)
        } else {
          setSelectedMarker(null)
        }
        return
      }

      const isOverlapMarker =
        LAYER_IDS.allPoints.includes(feature.layer?.id ?? '') &&
        feature.properties?.isOverlapping === true &&
        feature.properties?.overlapId !== undefined

      if (isOverlapMarker) {
        const overlapId = feature.properties.overlapId as string
        const overlapGroup = overlapGroupsMap.get(overlapId)
        if (overlapGroup) {
          const spiderGroup = createSpiderGroup(overlapGroup.tasks, overlapGroup.center, map)
          setSpideredMarkers(spiderGroup)
          setSelectedMarker(null)
        } else {
          const clickPoint = e.point
          const visuallyOverlappingMarkers = detectVisualOverlaps(
            map,
            clickPoint,
            LAYER_IDS.allPoints,
            15
          )
          if (visuallyOverlappingMarkers.length > 0) {
            const lngLat = e.lngLat
            const coordinates: [number, number] = [lngLat.lng, lngLat.lat]
            const spiderGroup = createSpiderGroup(visuallyOverlappingMarkers, coordinates, map)
            setSpideredMarkers(spiderGroup)
            setSelectedMarker(null)
          }
        }
        return
      }

      const isClientSideCluster =
        feature.properties?.cluster_id !== undefined ||
        feature.properties?.point_count !== undefined

      if (isClientSideCluster && feature.geometry.type === 'Point') {
        const coordinates = feature.geometry.coordinates as [number, number]
        const clusterId = feature.properties.cluster_id as number | undefined
        flyToClusterExpansion(map, superclusterRef.current, clusterId, coordinates)
        setSpideredMarkers(new Map())
        return
      }

      const isUnclusteredPoint =
        LAYER_IDS.allPoints.includes(feature.layer?.id ?? '') &&
        feature.properties?.id !== undefined &&
        feature.geometry.type === 'Point'

      if (isUnclusteredPoint) {
        const clickPoint = e.point
        const visuallyOverlappingMarkers = detectVisualOverlaps(
          map,
          clickPoint,
          LAYER_IDS.allPoints,
          15
        )

        if (visuallyOverlappingMarkers.length > 1) {
          const lngLat = e.lngLat
          const coordinates: [number, number] = [lngLat.lng, lngLat.lat]
          const spiderGroup = createSpiderGroup(visuallyOverlappingMarkers, coordinates, map)
          setSpideredMarkers(spiderGroup)
          setSelectedMarker(null)
          return
        }

        const taskId = feature.properties.id as number
        if (taskId === primaryTaskId) {
          setSpideredMarkers(new Map())
          setSelectedMarker(null)
          return
        }
        const task = markersData.markers.find((m) => m.id === taskId)
        if (task) {
          setSpideredMarkers(new Map())
          setSelectedMarker(task)
        }
        return
      }

      setSpideredMarkers(new Map())
      setSelectedMarker(null)
    },
    [markersData.markers, setSelectedMarker, overlapGroupsMap, primaryTaskId]
  )

  const handleMapMouseMove = useCallback(
    (e: MapMouseEvent) => {
      if (!mapRef.current) return

      const map = mapRef.current.getMap()
      if (!map) return

      const layersToQuery: string[] = []
      if (shouldCluster) {
        if (map.getLayer(LAYER_IDS.clusters)) {
          layersToQuery.push(LAYER_IDS.clusters)
        }
        if (map.getLayer(LAYER_IDS.clusterCount)) {
          layersToQuery.push(LAYER_IDS.clusterCount)
        }
        for (const id of LAYER_IDS.allPoints) {
          if (map.getLayer(id)) layersToQuery.push(id)
        }
      } else {
        for (const id of LAYER_IDS.allPoints) {
          if (map.getLayer(id)) layersToQuery.push(id)
        }
      }

      if (layersToQuery.length === 0) {
        map.getCanvas().style.cursor = ''
        return
      }

      const features = map.queryRenderedFeatures(e.point, {
        layers: layersToQuery,
      })

      if (features && features.length > 0) {
        const feature = features[0]
        const isCluster =
          feature.properties?.cluster_id !== undefined ||
          feature.properties?.point_count !== undefined
        const isMarker =
          LAYER_IDS.allPoints.includes(feature.layer?.id ?? '') ||
          feature.layer?.id === LAYER_IDS.clusters ||
          feature.layer?.id === LAYER_IDS.clusterCount

        if (isCluster || isMarker) {
          map.getCanvas().style.cursor = 'pointer'
        } else {
          map.getCanvas().style.cursor = ''
        }
      } else {
        map.getCanvas().style.cursor = ''
      }
    },
    [shouldCluster]
  )

  const onMapClick = useCallback(
    (e: MapMouseEvent) => {
      if (!drawingMode) {
        handleMapClick(e)
      }
    },
    [drawingMode, handleMapClick]
  )

  const onMouseMove = useCallback(
    (e: MapMouseEvent) => {
      if (!drawingMode) {
        handleMapMouseMove(e)
      }
    },
    [drawingMode, handleMapMouseMove]
  )

  return { onMapClick, onMouseMove }
}
