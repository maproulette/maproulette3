import { useEffect, useCallback } from 'react'
import { useMapContext } from '@/contexts/challenges/MapContext'
import { useSearchContext } from '@/contexts/challenges/SearchContext'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { CLUSTER_CONFIG, LAYER_IDS } from './const'
import { addMapLayers } from './addMapLayers'
import { createMarkerIcons } from './createMarkerIcons'
import { setupEventListeners } from './eventListeners'
import { detectOverlappingTasks } from './overlapUtils'

export const TaskMarkers = () => {
  const { map, mapLoaded } = useMapContext()
  const { taskMarkerParams } = useSearchContext()
  const { data: taskMarkers, isLoading: isLoadingTaskMarkers } = useQuery(
    api.task.getTaskMarkers(taskMarkerParams)
  )

  const cleanupLayers = useCallback(() => {
    if (!map.current) return

    // Clean up task marker layers
    if (map.current.getSource(LAYER_IDS.source)) {
      Object.values(LAYER_IDS).forEach((layerId) => {
        if (layerId !== LAYER_IDS.source && map.current!.getLayer(layerId)) {
          map.current!.removeLayer(layerId)
        }
      })
      map.current.removeSource(LAYER_IDS.source)
    }
  }, [map])

  const cleanupPopups = useCallback(() => {
    const existingPopups = document.querySelectorAll('.maplibregl-popup')
    existingPopups.forEach((popup) => popup.remove())
  }, [])

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
          const overlapGroup = overlaps.find(overlap => 
            overlap.tasks.some(task => task.id === marker.id)
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
      cluster: true,
      clusterMaxZoom: CLUSTER_CONFIG.maxZoom,
      clusterRadius: CLUSTER_CONFIG.radius,
    })

    // Note: Overlapping tasks are now integrated into the main clustering system
    // No separate overlap visualization needed - enhanced markers will show in clusters

    // Add regular map layers
    addMapLayers(map)
    setupEventListeners(map)

    return () => {
      cleanupPopups()
    }
  }, [map, mapLoaded, taskMarkers, isLoadingTaskMarkers, cleanupLayers, cleanupPopups])

  return null
}
