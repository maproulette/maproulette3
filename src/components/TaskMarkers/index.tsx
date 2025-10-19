import maplibregl from 'maplibre-gl'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useMapContext } from '@/contexts/MapContext'
import type { TaskMarker } from '@/types/Task'
import { ClusterToggle } from '../BrowsedChallengePage/ChallengesMap/ClusterToggle'
import { addMapLayers } from './addMapLayers'
import { CLUSTER_CONFIG, LAYER_IDS } from './const'
import { createMarkerIcons } from './createMarkerIcons'
import { setupEventListeners } from './eventListeners'
import { detectOverlappingTasks } from './overlapUtils'

export const TaskMarkers = ({
  taskMarkers,
  isLoadingTaskMarkers,
}: {
  taskMarkers: TaskMarker[] | undefined
  isLoadingTaskMarkers: boolean
}) => {
  const { map, mapLoaded, clusteringEnabled } = useMapContext()
  const hasZoomedToTasksRef = useRef(false)
  const [visibleTaskCount, setVisibleTaskCount] = useState(0)

  useEffect(() => {
    if (!map.current || !taskMarkers || !mapLoaded) return

    const updateVisibleCount = () => {
      const bounds = map.current?.getBounds()
      if (!bounds) return

      const count = taskMarkers.filter((marker) => {
        return bounds.contains([marker.location.lng, marker.location.lat])
      }).length

      setVisibleTaskCount(count)
    }

    updateVisibleCount()
    map.current.on('move', updateVisibleCount)

    return () => {
      map.current?.off('move', updateVisibleCount)
    }
  }, [map, taskMarkers, mapLoaded])

  const forceCluster = visibleTaskCount > 500
  const effectiveClusteringEnabled = forceCluster ? true : clusteringEnabled

  const cleanupLayers = useCallback(() => {
    if (!map.current) return

    // Clean up task marker layers
    if (map.current.getSource(LAYER_IDS.source)) {
      Object.values(LAYER_IDS).forEach((layerId) => {
        if (layerId !== LAYER_IDS.source && map.current?.getLayer(layerId)) {
          map.current?.removeLayer(layerId)
        }
      })
      map.current.removeSource(LAYER_IDS.source)
    }
  }, [map])

  const cleanupPopups = useCallback(() => {
    const existingPopups = document.querySelectorAll('.maplibregl-popup')
    existingPopups.forEach((popup) => {
      popup.remove()
    })
  }, [])

  const zoomToTasks = useCallback(
    (markers: TaskMarker[]) => {
      if (!map.current || markers.length === 0) return

      const bounds = new maplibregl.LngLatBounds()

      markers.forEach((marker) => {
        bounds.extend([marker.location.lng, marker.location.lat])
      })

      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 16,
        })
      }
    },
    [map]
  )

  useEffect(() => {
    if (!map.current || !taskMarkers || isLoadingTaskMarkers || !mapLoaded) return

    createMarkerIcons(map)
    cleanupLayers()
    cleanupPopups()

    // Detect overlapping tasks for enhanced visualization
    const { overlaps } = detectOverlappingTasks(taskMarkers)

    // Add all task markers to the main source (including overlapping ones for clustering)
    map.current.addSource(LAYER_IDS.source, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: taskMarkers.map((marker) => {
          // Check if this marker is part of an overlap group
          const overlapGroup = overlaps.find((overlap) =>
            overlap.tasks.some((task) => task.id === marker.id)
          )

          return {
            type: 'Feature',
            properties: {
              id: marker.id,
              status: marker.status,
              challengeName: marker.challengeName,
              isOverlapping: !!overlapGroup,
              overlapId: overlapGroup?.id,
              overlapTaskCount: overlapGroup?.tasks.length,
              hasMultipleStatuses: overlapGroup?.hasMultipleStatuses,
              dominantStatus: overlapGroup?.dominantStatus,
            },
            geometry: {
              type: 'Point',
              coordinates: [marker.location.lng, marker.location.lat],
            },
          }
        }),
      },
      cluster: effectiveClusteringEnabled,
      clusterMaxZoom: CLUSTER_CONFIG.maxZoom,
      clusterRadius: CLUSTER_CONFIG.radius,
    })

    // Note: Overlapping tasks are now integrated into the main clustering system
    // No separate overlap visualization needed - enhanced markers will show in clusters

    // Add regular map layers
    addMapLayers(map)
    setupEventListeners(map)

    // Zoom to tasks on first fetch
    if (!hasZoomedToTasksRef.current && taskMarkers.length > 0) {
      zoomToTasks(taskMarkers)
      hasZoomedToTasksRef.current = true
    }

    return () => {
      cleanupPopups()
    }
  }, [
    map,
    mapLoaded,
    taskMarkers,
    isLoadingTaskMarkers,
    effectiveClusteringEnabled,
  ])

  return <ClusterToggle disabled={forceCluster} taskCount={visibleTaskCount} />
}
