import { useMemo } from 'react'
import { api } from '@/api'
import { calculateTaskCount, processMarkersData } from '@/components/Map/TaskMarkers/utils'
import { useTaskBundleContext } from '@/components/Pages/TaskEditPage/contexts/TaskBundleContext'
import { useTaskContext } from '@/components/Pages/TaskEditPage/contexts/TaskContext'
import type { OverlapGroupsMap } from './taskEditMapTypes'

// Stable empty set fed to the index builders when showBundleOnly is off, so the
// bundle changing doesn't churn their memo deps (and thus never re-clusters).
const EMPTY_TASK_IDS: ReadonlySet<number> = new Set()

/**
 * Fetches the challenge's task markers and derives the marker/overlap data the
 * rest of the task-edit map pipeline (geoJSON building, clustering) is built
 * from. Also computes the bundle-membership sets used to filter that pipeline
 * when "show bundle only" is enabled.
 */
export const useTaskMarkerData = () => {
  const { showBundleOnly, activeBundle } = useTaskBundleContext()
  const { task } = useTaskContext()
  const primaryTaskId = task.id
  const challengeId = task.parent

  const { data: taskMarkersData, isLoading: isLoadingMarkers } =
    api.challenge.getChallengeTaskMarkers(challengeId)

  const taskCount = useMemo(() => calculateTaskCount(taskMarkersData), [taskMarkersData])

  const markersData = useMemo(() => {
    return processMarkersData(taskMarkersData)
  }, [taskMarkersData])

  const bundleTaskIdsSet = useMemo(() => {
    return new Set(activeBundle?.taskIds ?? [])
  }, [activeBundle?.taskIds])

  // The bundle changes the *visible marker set* only when showBundleOnly is on.
  // Otherwise the supercluster INDEX must stay independent of the bundle — bundle
  // emphasis is applied later at the clustered output (clusteredGeoJSONData) — so
  // we feed a stable empty set into the index builders when the filter is off.
  // This is what keeps adding/removing a bundle member from re-running supercluster.
  const bundleFilterIds = showBundleOnly ? bundleTaskIdsSet : EMPTY_TASK_IDS

  const overlapData = useMemo(() => {
    let overlapMarkersToUse = markersData.overlapMarkers

    if (showBundleOnly) {
      overlapMarkersToUse = markersData.overlapMarkers.filter((overlap) => {
        return overlap.tasks.some(
          (task) => task.id === primaryTaskId || bundleFilterIds.has(task.id)
        )
      })
    }

    const overlaps = overlapMarkersToUse.map((overlap) => {
      const center: [number, number] = [overlap.location.lng, overlap.location.lat]
      const taskIds = overlap.tasks.map((t) => t.id).join('-')
      const overlapId = `overlap-${taskIds}`

      return {
        id: overlapId,
        center,
        tasks: overlap.tasks,
        radius: 8,
      }
    })

    return { overlaps, nonOverlapping: [] }
  }, [markersData.overlapMarkers, showBundleOnly, bundleFilterIds, primaryTaskId])

  const overlappingTaskIds = useMemo(() => {
    const ids = new Set<number>()
    markersData.overlapMarkers.forEach((overlap) => {
      overlap.tasks.forEach((task) => {
        ids.add(task.id)
      })
    })
    return ids
  }, [markersData.overlapMarkers])

  const overlapGroupsMap = useMemo((): OverlapGroupsMap => {
    const map: OverlapGroupsMap = new Map()
    overlapData.overlaps.forEach((overlap) => {
      map.set(overlap.id, { center: overlap.center, tasks: overlap.tasks })
    })
    return map
  }, [overlapData.overlaps])

  return {
    isLoadingMarkers,
    taskCount,
    markersData,
    bundleTaskIdsSet,
    bundleFilterIds,
    overlapData,
    overlappingTaskIds,
    overlapGroupsMap,
  }
}
