import { useEffect, useRef } from 'react'
import { Layer, Source, useMap } from 'react-map-gl/maplibre'
import { OVERLAY_GLYPHS_URL } from '@/components/Map/mapStyles'
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

  // Add a glyphs URL to the style in case it doesn't have one (raster styles
  // don't, but we need glyphs for our cluster markers)
  useEffect(() => {
    const map = mapInstance?.getMap()
    if (!map) return

    // TODO: this overwrites any existing glyphs URL, which may break vector
    // styles if they use a different glyphs source.
    const applyGlyphs = () => map.setGlyphs(OVERLAY_GLYPHS_URL)
    if (map.isStyleLoaded()) applyGlyphs()
    map.on('style.load', applyGlyphs)

    return () => {
      map.off('style.load', applyGlyphs)
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
