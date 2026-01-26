import { useMemo, useRef, useState } from 'react'
import type { MapRef } from 'react-map-gl/maplibre'
import { useExploreChallengesSearchContext } from '../ExploreChallengesSearchContext'
import type { PopupInfo } from './types'
import { useMapData } from './useMapData'
import { useMapInteractions } from './useMapInteractions'
import { useMapStyle } from './useMapStyle'

// Re-export cluster layers for convenience
export { clusterCountLayer, clusterLayer, unclusteredPointLayer } from './clusterLayers'

// Re-export PopupInfo type for convenience
export type { PopupInfo } from './types'

export const useExploreChallengesMap = () => {
  const { cluster, setCluster, locationGeojson } = useExploreChallengesSearchContext()
  const mapRef = useRef<MapRef | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [isStylePanelOpen, setIsStylePanelOpen] = useState(false)
  const [popupInfo, setPopupInfo] = useState<PopupInfo>(null)

  const { taskCount, markersData, geoJSONData, overlapData, isLoadingMarkers } = useMapData(cluster)

  const shouldCluster = useMemo(() => {
    if (taskCount >= 500) {
      return true
    }

    return cluster
  }, [taskCount, cluster])

  const { defaultStyle } = useMapStyle(mapRef, mapLoaded, shouldCluster)

  const {
    handleMapMoveEnd,
    handleMapClick,
    handleMapMouseMove,
    spideredMarkers,
    setSpideredMarkers,
  } = useMapInteractions(
    mapRef,
    mapLoaded,
    shouldCluster,
    overlapData,
    popupInfo,
    setPopupInfo,
    markersData
  )

  return {
    mapRef,
    mapLoaded,
    setMapLoaded,
    isStylePanelOpen,
    setIsStylePanelOpen,
    popupInfo,
    setPopupInfo,
    defaultStyle,
    taskCount,
    shouldCluster,
    markersData,
    overlapData,
    isLoadingMarkers,
    handleMapMoveEnd,
    handleMapClick,
    handleMapMouseMove,
    setCluster,
    geoJSONData,
    locationGeojson,
    spideredMarkers,
    setSpideredMarkers,
  }
}
