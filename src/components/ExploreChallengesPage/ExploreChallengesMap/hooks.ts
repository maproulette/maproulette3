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
  const { cluster, setCluster } = useExploreChallengesSearchContext()
  const mapRef = useRef<MapRef | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [isStylePanelOpen, setIsStylePanelOpen] = useState(false)
  const [popupInfo, setPopupInfo] = useState<PopupInfo>(null)

  // Get data using the extracted hook (initially with cluster preference)
  const { taskCount, markersData, geoJSONData, overlapData, isLoadingMarkers } = useMapData(cluster)

  // Compute whether clustering should be active (temporarily overridden for 500+ tasks)
  const shouldCluster = useMemo(() => {
    // Clustering is temporarily enforced for 500+ tasks, regardless of user preference
    if (taskCount >= 500) {
      return true
    }
    // Otherwise use the user's preference
    return cluster
  }, [taskCount, cluster])

  // Get style using the extracted hook
  const { defaultStyle } = useMapStyle(mapRef, mapLoaded, shouldCluster)

  // Get interactions using the extracted hook
  const { handleMapMoveEnd, handleMapClick, handleMapMouseMove } = useMapInteractions(
    mapRef,
    mapLoaded,
    shouldCluster,
    overlapData,
    popupInfo,
    setPopupInfo
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
  }
}
