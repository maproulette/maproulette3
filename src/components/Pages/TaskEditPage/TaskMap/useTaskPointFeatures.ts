import { useMemo } from 'react'
import {
  convertTaskMarkersToGeoJSON,
  isTaskEligibleForBundle,
} from '@/components/Map/TaskMarkers/utils'
import { useTaskBundleContext } from '@/components/Pages/TaskEditPage/contexts/TaskBundleContext'
import { useTaskContext } from '@/components/Pages/TaskEditPage/contexts/TaskContext'
import { useAuthContext } from '@/contexts/AuthContext'
import type { TaskMarker } from '@/types/Task'

interface MarkersData {
  markers: TaskMarker[]
  overlapMarkers: Array<{ location: { lng: number; lat: number }; tasks: TaskMarker[] }>
}

interface OverlapData {
  overlaps: Array<{ id: string; center: [number, number]; tasks: TaskMarker[]; radius: number }>
}

/**
 * Builds the base (unclustered) GeoJSON feature collection for the task-edit
 * map, and the flattened point-feature list fed into Supercluster. Overlap
 * groups stand in for their member tasks so each location renders once;
 * per-task emphasis (bundle/primary/selection) is computed later, downstream,
 * at the clustered output — this stage only computes bundle-eligibility and
 * distance-to-primary, which are independent of clustering/selection.
 */
export const useTaskPointFeatures = (
  markersData: MarkersData,
  overlapData: OverlapData,
  overlappingTaskIds: ReadonlySet<number>,
  bundleFilterIds: ReadonlySet<number>
) => {
  const { showBundleOnly } = useTaskBundleContext()
  const { task } = useTaskContext()
  const { user } = useAuthContext()
  const primaryTaskId = task.id

  const geoJSONData = useMemo(() => {
    let markersToUse = markersData.markers

    if (showBundleOnly) {
      markersToUse = markersData.markers.filter(
        (marker) => marker.id === primaryTaskId || bundleFilterIds.has(marker.id)
      )
    }

    let nonOverlappingMarkers = markersToUse
    if (overlappingTaskIds.size > 0) {
      nonOverlappingMarkers = markersToUse.filter((marker) => !overlappingTaskIds.has(marker.id))
    }

    const baseGeoJSON =
      nonOverlappingMarkers.length > 0
        ? convertTaskMarkersToGeoJSON(nonOverlappingMarkers as TaskMarker[])
        : { type: 'FeatureCollection' as const, features: [] }

    if (overlapData.overlaps.length > 0) {
      const overlapFeatures = overlapData.overlaps.map((overlap) => {
        // Emphasis (bundle/primary/selection) is computed later at the clustered
        // output, so the index input stays independent of bundle/selection and
        // never re-clusters when a member is added/removed.
        return {
          type: 'Feature' as const,
          properties: {
            id: overlap.tasks[0].id,
            overlapId: overlap.id,
            isOverlapping: true,
            overlapTaskCount: overlap.tasks.length,
            status: 0,
            priority: 0,
          },
          geometry: {
            type: 'Point' as const,
            coordinates: overlap.center,
          },
        }
      })

      return {
        type: 'FeatureCollection' as const,
        features: [...baseGeoJSON.features, ...overlapFeatures],
      } as GeoJSON.FeatureCollection
    }

    return baseGeoJSON as GeoJSON.FeatureCollection
  }, [
    markersData.markers,
    primaryTaskId,
    showBundleOnly,
    bundleFilterIds,
    overlappingTaskIds,
    overlapData.overlaps,
  ])

  const pointFeatures = useMemo(() => {
    const primaryTaskBundleId = task.bundleId ?? null
    const currentUserId = user?.id ?? null

    const primaryFeature = geoJSONData.features.find(
      (f) => f.geometry.type === 'Point' && f.properties?.id === primaryTaskId
    ) as GeoJSON.Feature<GeoJSON.Point> | undefined
    const primaryCoords = primaryFeature?.geometry.coordinates as [number, number] | undefined

    const features = geoJSONData.features
      .filter((f): f is GeoJSON.Feature<GeoJSON.Point> => f.geometry.type === 'Point')
      .map((feature) => {
        const taskId = feature.properties?.id as number | undefined
        const isOverlapping = feature.properties?.isOverlapping === true

        // isPrimary is bundle-independent (the edited task never changes
        // mid-session); kept local for eligibility/distance only.
        const isPrimary = taskId === primaryTaskId

        const markerBundleId = (feature.properties?.bundleId as number | null) ?? null
        const markerLockedBy = (feature.properties?.lockedBy as number | null) ?? null
        const markerStatus = feature.properties?.status as number

        const isEligibleForBundle =
          isPrimary ||
          isTaskEligibleForBundle(
            { status: markerStatus, bundleId: markerBundleId, lockedBy: markerLockedBy },
            primaryTaskBundleId,
            currentUserId
          )

        let distanceToPrimary = 0
        if (primaryCoords && !isPrimary) {
          const [lng, lat] = feature.geometry.coordinates
          const dLng = lng - primaryCoords[0]
          const dLat = lat - primaryCoords[1]
          distanceToPrimary = Math.sqrt(dLng * dLng + dLat * dLat)
        }

        return {
          type: 'Feature' as const,
          geometry: feature.geometry,
          properties: {
            cluster: false as const,
            id: taskId as number,
            status: markerStatus,
            priority: feature.properties?.priority as number,
            bundleId: markerBundleId,
            lockedBy: markerLockedBy,
            // Bundle/primary/selection emphasis is computed later at the clustered
            // OUTPUT (clusteredGeoJSONData), not in this index input — so adding a
            // bundle member or clicking a marker never re-runs supercluster.
            isLassoSelected: false,
            isOverlapping,
            isEligibleForBundle,
            distanceToPrimary,
            overlapId: feature.properties?.overlapId as string | undefined,
            overlapTaskCount: feature.properties?.overlapTaskCount as number | undefined,
          },
        }
      })

    return features
  }, [geoJSONData, primaryTaskId, task.bundleId, user?.id])

  return { geoJSONData, pointFeatures }
}
