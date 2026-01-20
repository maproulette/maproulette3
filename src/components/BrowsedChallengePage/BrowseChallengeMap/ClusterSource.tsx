import { Layer, Source } from 'react-map-gl/maplibre'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import { clusterCountLayer, clusterLayer, unclusteredPointLayer } from './clusterLayers'

interface ClusterSourceProps {
  geoJSONData: GeoJSON.FeatureCollection
}

export const ClusterSource = ({ geoJSONData }: ClusterSourceProps) => {
  return (
    <Source
      id={LAYER_IDS.source}
      type="geojson"
      data={geoJSONData}
      cluster={true}
      clusterMaxZoom={14} // Higher max zoom = clustering stops earlier, showing more individual markers
      clusterRadius={40} // Smaller radius = markers need to be closer to cluster, less dense clustering
    >
      <Layer {...clusterLayer} />
      <Layer {...clusterCountLayer} />
      <Layer {...unclusteredPointLayer} />
    </Source>
  )
}
