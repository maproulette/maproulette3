import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { api } from '@/api'
import { detectOverlappingTasks } from '@/components/shared/TaskMarkers/overlapUtils'
import type { TaskCluster, TaskMarker } from '@/types/Task'
import { useExploreChallengesSearchContext } from '../ExploreChallengesSearchContext'
import {
  calculateTaskCount,
  convertTaskMarkersToGeoJSON,
  isValidLocation,
  processMarkersData,
} from './utils'

export const useMapData = (shouldCluster: boolean) => {
  const { taskMarkerParams, cluster, setCluster } = useExploreChallengesSearchContext()

  const { data: taskMarkersData, isLoading: isLoadingMarkers } = useQuery(
    api.task.getTaskMarkers(taskMarkerParams)
  )

  const taskCount = useMemo(() => calculateTaskCount(taskMarkersData), [taskMarkersData])

  useEffect(() => {
    if (taskCount > 0 && taskCount < 100 && cluster) {
      setCluster(false)
    }
  }, [taskCount, cluster, setCluster])

  const markersData = useMemo(() => processMarkersData(taskMarkersData), [taskMarkersData])

  const geoJSONData = useMemo(() => {
    if (markersData.clusters.length > 0) {
      return convertTaskMarkersToGeoJSON(markersData.clusters as TaskCluster[])
    }
    if (markersData.markers.length > 0) {
      return convertTaskMarkersToGeoJSON(markersData.markers as TaskMarker[])
    }
    return {
      type: 'FeatureCollection',
      features: [],
    } as GeoJSON.FeatureCollection
  }, [markersData])

  const overlapData = useMemo(() => {
    if (shouldCluster) {
      return { overlaps: [], nonOverlapping: [] }
    }

    if (markersData.markers.length === 0) {
      return { overlaps: [], nonOverlapping: [] }
    }

    const validMarkers = markersData.markers.filter((marker) => isValidLocation(marker.location))

    if (validMarkers.length === 0) {
      return { overlaps: [], nonOverlapping: [] }
    }

    const result = detectOverlappingTasks(validMarkers)

    return result
  }, [shouldCluster, markersData.markers])

  return {
    taskMarkersData,
    isLoadingMarkers,
    taskCount,
    markersData,
    geoJSONData,
    overlapData,
  }
}
