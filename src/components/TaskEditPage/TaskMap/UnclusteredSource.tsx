import { Layer, Source } from 'react-map-gl/maplibre'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import { unclusteredPointLayer } from './clusterLayers'

interface UnclusteredSourceProps {
  geoJSONData: GeoJSON.FeatureCollection
  showBundleOnly?: boolean
  primaryTaskId: number
  activeBundle?: { bundleId: number; taskIds: number[] } | null
}

/**
 * Renders unclustered markers using MapLibre's native layer-based rendering.
 * This is much more efficient than React Marker components for large numbers of markers.
 */
export const UnclusteredSource = ({
  geoJSONData,
  showBundleOnly = false,
  primaryTaskId,
  activeBundle,
}: UnclusteredSourceProps) => {
  // Enhance GeoJSON features with overlap and highlight information
  const enhancedGeoJSON = {
    ...geoJSONData,
    features: geoJSONData.features.map((feature) => {
      const taskId = feature.properties?.id as number | undefined
      const isPrimary = taskId === primaryTaskId
      const isBundled = activeBundle?.taskIds.includes(taskId ?? -1) ?? false
      const isHighlighted = isPrimary || isBundled

      return {
        ...feature,
        properties: {
          ...feature.properties,
          isHighlighted,
          isSelected: false,
          isHovered: false,
          isOverlapping: false,
        },
      }
    }),
  }

  return (
    <Source id={LAYER_IDS.source} type="geojson" data={enhancedGeoJSON}>
      <Layer {...unclusteredPointLayer} />
    </Source>
  )
}

