import { useMemo } from 'react'
import type Supercluster from 'supercluster'
import { useTaskContext } from '@/components/Pages/TaskEditPage/contexts/TaskContext'
import { useTaskMapContext } from '@/components/Pages/TaskEditPage/contexts/TaskMapContext'
import type { Bbox2D } from '@/types/Map'
import type {
  ClusterProperties,
  OverlapGroupsMap,
  PointProperties,
  SpideredMarkers,
} from './taskEditMapTypes'

/**
 * Runs the active Supercluster index against the current viewport and styles
 * the result with bundle/primary/selection emphasis. This emphasis is applied
 * here — at the clustered *output* — rather than baked into the index input,
 * so changing the bundle or selection re-runs only this (cheap) getClusters()
 * + map, never a Supercluster reload.
 */
export const useClusteredGeoJSONData = (
  superclusterIndex: Supercluster<PointProperties, ClusterProperties> | null,
  mapBounds: Bbox2D,
  mapZoom: number,
  iconsVersion: number,
  spideredMarkers: SpideredMarkers,
  bundleTaskIdsSet: ReadonlySet<number>,
  overlapGroupsMap: OverlapGroupsMap
): GeoJSON.FeatureCollection => {
  const { task } = useTaskContext()
  const { selectedMarker } = useTaskMapContext()
  const primaryTaskId = task.id
  const selectedId = selectedMarker?.id ?? null

  return useMemo((): GeoJSON.FeatureCollection => {
    if (!superclusterIndex) {
      return { type: 'FeatureCollection', features: [] }
    }

    const effectiveZoom = mapZoom < 2 ? 0 : mapZoom
    const clusters = superclusterIndex.getClusters(mapBounds, effectiveZoom)

    const filteredClusters = clusters.filter((cluster) => {
      if ('cluster_id' in cluster.properties && 'point_count' in cluster.properties) {
        return true
      }

      const taskId = (cluster.properties as PointProperties).id
      return !spideredMarkers.has(taskId)
    })

    const features = filteredClusters.map((cluster) => {
      const isCluster =
        cluster.properties &&
        'cluster_id' in cluster.properties &&
        'point_count' in cluster.properties

      if (isCluster) {
        const props = cluster.properties as ClusterProperties

        const actualTaskCount = props.taskCount || props.point_count
        return {
          type: 'Feature' as const,
          geometry: cluster.geometry,
          properties: {
            cluster: true,
            cluster_id: props.cluster_id,
            point_count: actualTaskCount,
            point_count_abbreviated:
              actualTaskCount >= 1000
                ? `${Math.round(actualTaskCount / 1000)}k`
                : String(actualTaskCount),
          },
        }
      }

      const pointProps = cluster.properties as PointProperties

      // Compute emphasis from the current bundle/selection. Overlap markers stand
      // in for a whole group, so they inherit the group's membership.
      let isHighlighted: boolean
      let isPrimary: boolean
      let isSelected: boolean
      if (pointProps.isOverlapping && pointProps.overlapId != null) {
        const tasks = overlapGroupsMap.get(pointProps.overlapId)?.tasks ?? []
        isPrimary = tasks.some((t) => t.id === primaryTaskId)
        isHighlighted = isPrimary || tasks.some((t) => bundleTaskIdsSet.has(t.id))
        isSelected = selectedId != null && tasks.some((t) => t.id === selectedId)
      } else {
        isPrimary = pointProps.id === primaryTaskId
        isHighlighted = isPrimary || bundleTaskIdsSet.has(pointProps.id)
        isSelected = pointProps.id === selectedId
      }

      return {
        type: 'Feature' as const,
        geometry: cluster.geometry,
        properties: {
          id: pointProps.id,
          status: pointProps.status,
          priority: pointProps.priority,
          bundleId: pointProps.bundleId,
          lockedBy: pointProps.lockedBy,
          isHighlighted,
          isPrimary,
          isSelected,
          isLassoSelected: pointProps.isLassoSelected,
          isOverlapping: pointProps.isOverlapping,
          isEligibleForBundle: pointProps.isEligibleForBundle,
          distanceToPrimary: pointProps.distanceToPrimary,
          overlapId: pointProps.overlapId,
          overlapTaskCount: pointProps.overlapTaskCount,
        },
      }
    })

    return {
      type: 'FeatureCollection',
      features,
    }
  }, [
    superclusterIndex,
    mapBounds,
    mapZoom,
    iconsVersion,
    spideredMarkers,
    bundleTaskIdsSet,
    primaryTaskId,
    selectedId,
    overlapGroupsMap,
  ])
}
