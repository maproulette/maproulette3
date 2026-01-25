import { useEffect, useRef } from 'react'
import { Layer, Source, useMap } from 'react-map-gl/maplibre'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import { createMarkerIcons } from '@/components/shared/TaskMarkers/createMarkerIcons'
import { clusterCountLayer, clusterLayer, unclusteredPointLayer } from './clusterLayers'

interface ClusterSourceProps {
  clusteredData: GeoJSON.FeatureCollection
  clusterRadius?: number
  showBundleOnly?: boolean
}

export const ClusterSource = ({
  clusteredData,
}: ClusterSourceProps) => {
  const { current: mapInstance } = useMap()
  const iconsCreatedRef = useRef(false)

  // Create icons if they don't exist
  useEffect(() => {
    const map = mapInstance?.getMap()
    if (!map) {
      console.log('[ClusterSource] No map instance yet')
      return
    }

    // Check if icons already exist
    const hasTestIcon = map.hasImage('marker-pin-0-1')
    console.log('[ClusterSource] Checking icons - hasImage(marker-pin-0-1):', hasTestIcon, 'iconsCreatedRef:', iconsCreatedRef.current)

    if (!hasTestIcon && !iconsCreatedRef.current) {
      console.log('[ClusterSource] Icons missing! Creating icons now...')
      iconsCreatedRef.current = true

      // Create icons directly
      createMarkerIcons({ current: map }, () => {
        console.log('[ClusterSource] Icons created via callback!')
        map.triggerRepaint()
      })
    }
  }, [mapInstance])

  useEffect(() => {
    const clusterFeatures = clusteredData.features.filter(f => f.properties?.point_count)
    const pointFeatures = clusteredData.features.filter(f => !f.properties?.point_count && f.properties?.id)

    // Check if icons exist on the map
    const map = mapInstance?.getMap()
    const iconTests = ['marker-pin-0-1', 'marker-pin-0-0', 'marker-pin-1-1']
    const iconStatus = iconTests.map(name => ({
      name,
      exists: map ? map.hasImage(name) : 'no map',
    }))

    // Check if layer exists and its properties
    const layerExists = map ? map.getLayer(LAYER_IDS.points) : null
    const sourceExists = map ? map.getSource(LAYER_IDS.source) : null

    console.log('[ClusterSource] Rendering with data:', {
      totalFeatures: clusteredData.features.length,
      clusterFeatures: clusterFeatures.length,
      pointFeatures: pointFeatures.length,
      samplePoint: pointFeatures[0]?.properties,
      iconStatus,
      hasMap: !!map,
      layerExists: !!layerExists,
      layerType: layerExists?.type,
      sourceExists: !!sourceExists,
    })

    // Try to query features from the layer to see what's there
    if (map && map.getLayer(LAYER_IDS.points)) {
      try {
        const renderedFeatures = map.queryRenderedFeatures(undefined, { layers: [LAYER_IDS.points] })
        console.log('[ClusterSource] Rendered features on points layer:', renderedFeatures.length, renderedFeatures.slice(0, 3))
      } catch (e) {
        console.log('[ClusterSource] Could not query features:', e)
      }
    }
  }, [clusteredData, mapInstance])

  return (
    <Source
      id={LAYER_IDS.source}
      type="geojson"
      data={clusteredData}
    >
       <Layer key="clusters" {...clusterLayer} />
       <Layer key="cluster-count" {...clusterCountLayer} />
      <Layer key="points" {...unclusteredPointLayer} />
    </Source>
  )
}
