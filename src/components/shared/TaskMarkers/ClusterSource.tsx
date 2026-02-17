import { useEffect, useRef } from 'react'
import { Layer, Source, useMap } from 'react-map-gl/maplibre'
import {
  clusterCountLayer,
  clusterLayer,
  unclusteredPointLayer,
} from '@/components/shared/TaskMarkers/clusterLayers'
import { CLUSTER_CONFIG, LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import { createMarkerIcons } from '@/components/shared/TaskMarkers/createMarkerIcons'

// Zoom level at which client-side clustering is enabled
const CLIENT_CLUSTER_MIN_ZOOM = 15

interface ClusterSourceProps {
  clusteredData: GeoJSON.FeatureCollection
  /** Current zoom level */
  zoom?: number
  /** Whether clustering is enabled by user */
  clusterEnabled?: boolean
}

export const ClusterSource = ({
  clusteredData,
  zoom = 0,
  clusterEnabled = true,
}: ClusterSourceProps) => {
  const { current: mapInstance } = useMap()
  const iconsCreatedRef = useRef(false)

  // Create icons if they don't exist
  useEffect(() => {
    const map = mapInstance?.getMap()
    if (!map) return

    // Check if icons already exist
    const hasTestIcon = map.hasImage('marker-pin-0-1')

    if (!hasTestIcon && !iconsCreatedRef.current) {
      iconsCreatedRef.current = true

      // Create icons directly
      createMarkerIcons({ current: map }, () => {
        map.triggerRepaint()
      })
    }
  }, [mapInstance])

  // At zoom 15+, use client-side clustering with supercluster (via MapLibre)
  const useClientSideClustering = zoom >= CLIENT_CLUSTER_MIN_ZOOM && clusterEnabled

  return (
    <Source
      id={LAYER_IDS.source}
      type="geojson"
      data={clusteredData}
      cluster={useClientSideClustering}
      clusterMaxZoom={22}
      clusterRadius={CLUSTER_CONFIG.radius}
    >
      <Layer key="clusters" {...clusterLayer} />
      <Layer key="cluster-count" {...clusterCountLayer} />
      <Layer key="points" {...unclusteredPointLayer} />
    </Source>
  )
}
