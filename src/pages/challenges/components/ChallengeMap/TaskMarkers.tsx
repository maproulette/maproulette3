import { useEffect, useCallback } from 'react'
import { useMapContext } from '../../MapContext'
import { useSearchContext } from '../../SearchContextProvider'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { CLUSTER_CONFIG, LAYER_IDS } from './const'
import { addMapLayers } from './addMapLayers'
import { createMarkerIcons } from './createMarkerIcons'
import { setupEventListeners } from './eventListeners'

export const TaskMarkers = () => {
  const { map, mapLoaded } = useMapContext()
  const { taskMarkerParams } = useSearchContext()
  const { data: taskMarkers, isLoading: isLoadingTaskMarkers } = useQuery(
    api.task.getTaskMarkers(taskMarkerParams)
  )

  const cleanupLayers = useCallback(() => {
    if (!map.current?.getSource(LAYER_IDS.source)) return

    Object.values(LAYER_IDS).forEach(layerId => {
      if (layerId !== LAYER_IDS.source && map.current!.getLayer(layerId)) {
        map.current!.removeLayer(layerId)
      }
    })
    map.current.removeSource(LAYER_IDS.source)
  }, [map])

  useEffect(() => {
    if (!map.current || !taskMarkers || isLoadingTaskMarkers || !mapLoaded) return


    createMarkerIcons(map)
    cleanupLayers()

    map.current.addSource(LAYER_IDS.source, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: taskMarkers.map(marker => ({
          type: 'Feature',
          properties: {
            id: marker.id,
            status: marker.status,
            challengeName: marker.challengeName,
          },
          geometry: {
            type: 'Point',
            coordinates: [marker.location.lng, marker.location.lat],
          },
        })),
      },
      cluster: true,
      clusterMaxZoom: CLUSTER_CONFIG.maxZoom,
      clusterRadius: CLUSTER_CONFIG.radius,
    })

    addMapLayers(map)
    setupEventListeners(map)

  }, [
    map,
    mapLoaded,
    taskMarkers,
    isLoadingTaskMarkers,
  ])

  return null
}
