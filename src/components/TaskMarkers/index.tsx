import { useEffect } from 'react'
import { useMapContext } from '@/contexts/MapContext'
import type { TaskMarker } from '@/types/Task'
import { ClusterToggle } from '../BrowsedChallengePage/ChallengesMap/ClusterToggle'
import { addMapLayers } from './addMapLayers'
import { CLUSTER_CONFIG, LAYER_IDS } from './const'
import { createMarkerIcons } from './createMarkerIcons'
import { setupEventListeners } from './eventListeners'
import { useVisibleTaskCount } from './hooks/useVisibleTaskCount'
import { detectOverlappingTasks } from './overlapUtils'
import { createFeatureCollection } from './utils/featureCreation'
import { cleanupLayers, cleanupPopups } from './utils/mapCleanup'

export const TaskMarkers = ({
  taskMarkers,
  isLoadingTaskMarkers,
}: {
  taskMarkers: TaskMarker[] | undefined
  isLoadingTaskMarkers: boolean
}) => {
  const { map, mapLoaded, clusteringEnabled, lastZoom } = useMapContext()
  const visibleTaskCount = useVisibleTaskCount(map, taskMarkers, mapLoaded)
  const zoomedOutTooFar = lastZoom < 9
  const taskCountTooMany = visibleTaskCount > 500
  const forceCluster = taskCountTooMany || zoomedOutTooFar
  const effectiveClusteringEnabled = forceCluster ? true : clusteringEnabled

  useEffect(() => {
    if (!map.current || !taskMarkers || isLoadingTaskMarkers || !mapLoaded) return

    createMarkerIcons(map)
    cleanupLayers(map.current)
    cleanupPopups()

    const { overlaps } = detectOverlappingTasks(taskMarkers)

    const featureCollection = createFeatureCollection(taskMarkers, overlaps)

    map.current.addSource(LAYER_IDS.source, {
      type: 'geojson',
      data: featureCollection,
      cluster: effectiveClusteringEnabled,
      clusterMaxZoom: CLUSTER_CONFIG.maxZoom,
      clusterRadius: CLUSTER_CONFIG.radius,
    })

    addMapLayers(map)
    setupEventListeners(map)

    return () => {
      cleanupPopups()
    }
  }, [map, mapLoaded, taskMarkers, isLoadingTaskMarkers, effectiveClusteringEnabled])

  return (
    <ClusterToggle
      zoomedOutTooFar={zoomedOutTooFar}
      disabled={forceCluster}
      taskCount={visibleTaskCount}
      taskCountTooMany={taskCountTooMany}
    />
  )
}
