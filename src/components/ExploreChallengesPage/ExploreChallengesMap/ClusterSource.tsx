import { Layer, Source } from 'react-map-gl/maplibre'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import { clusterCountLayer, clusterLayer, unclusteredPointLayer } from './clusterLayers'

interface ClusterSourceProps {
  geoJSONData: GeoJSON.FeatureCollection
}

export const ClusterSource = ({ geoJSONData }: ClusterSourceProps) => {
  return (
    <Source id={LAYER_IDS.source} type="geojson" data={geoJSONData} cluster={false}>
      <Layer {...clusterLayer} />
      <Layer {...clusterCountLayer} />
      <Layer {...unclusteredPointLayer} />
    </Source>
  )
}
