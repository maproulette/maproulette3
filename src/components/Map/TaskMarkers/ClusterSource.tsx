import { useEffect, useRef } from 'react'
import { Layer, Source, useMap } from 'react-map-gl/maplibre'
import {
  clusterCountLayer,
  clusterLayer,
  unclusteredCreatedPointLayer,
  unclusteredPointLayer,
} from '@/components/Map/TaskMarkers/clusterLayers'
import { LAYER_IDS } from '@/components/Map/TaskMarkers/const'
import { createMarkerIcons } from '@/components/Map/TaskMarkers/createMarkerIcons'

interface ClusterSourceProps {
  clusteredData: GeoJSON.FeatureCollection
}

export const ClusterSource = ({ clusteredData }: ClusterSourceProps) => {
  const { current: mapInstance } = useMap()
  const iconsCreatedRef = useRef(false)

  // Create icons if they don't exist
  useEffect(() => {
    const map = mapInstance?.getMap()
    if (!map) return

    const hasTestIcon = map.hasImage('marker-pin-0-1')

    if (!hasTestIcon && !iconsCreatedRef.current) {
      iconsCreatedRef.current = true
      createMarkerIcons({ current: map }, () => {
        map.triggerRepaint()
      })
    }
  }, [mapInstance])

  return (
    <Source id={LAYER_IDS.source} type="geojson" data={clusteredData}>
      <Layer key="clusters" {...clusterLayer} />
      <Layer key="cluster-count" {...clusterCountLayer} />
      <Layer key="points" {...unclusteredPointLayer} />
      {/* Rendered AFTER the non-Created layer so Created markers always sit on top. */}
      <Layer key="points-created" {...unclusteredCreatedPointLayer} />
    </Source>
  )
}
