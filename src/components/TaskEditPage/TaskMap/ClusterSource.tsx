import { Layer, Source } from 'react-map-gl/maplibre'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import { clusterCountLayer, clusterLayer, unclusteredPointLayer } from './clusterLayers'

interface ClusterSourceProps {
  geoJSONData: GeoJSON.FeatureCollection
  showBundleOnly?: boolean
}

export const ClusterSource = ({ geoJSONData, showBundleOnly = false }: ClusterSourceProps) => {
  // Disable clustering when showBundleOnly is true - bundled tasks shouldn't be clustered
  const shouldCluster = !showBundleOnly

  return (
    <Source
      id={LAYER_IDS.source}
      type="geojson"
      data={geoJSONData}
      cluster={shouldCluster}
      clusterMaxZoom={14}
      clusterRadius={40}
    >
      <Layer {...clusterLayer} />
      <Layer {...clusterCountLayer} />
      <Layer {...unclusteredPointLayer} />
    </Source>
  )
}
