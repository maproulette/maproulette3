import { useMemo } from 'react'
import { Layer, Source } from 'react-map-gl/maplibre'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import { clusterCountLayer, clusterLayer, unclusteredPointLayer } from './clusterLayers'

interface ClusterSourceProps {
  geoJSONData: GeoJSON.FeatureCollection
  showBundleOnly?: boolean
  primaryTaskId?: number
  activeBundle?: { bundleId: number; taskIds: number[] } | null
  selectedTaskId?: number | null
  lassoSelectedTaskIds?: Set<number>
}

export const ClusterSource = ({
  geoJSONData,
  showBundleOnly = false,
  primaryTaskId,
  activeBundle,
  selectedTaskId,
  lassoSelectedTaskIds = new Set(),
}: ClusterSourceProps) => {
  // Disable clustering when showBundleOnly is true - bundled tasks shouldn't be clustered
  const shouldCluster = !showBundleOnly

  // Apply styling properties to the GeoJSON features
  const styledGeoJSONData = useMemo(() => {
    const bundleTaskIds = new Set(activeBundle?.taskIds ?? [])

    const styledFeatures = geoJSONData.features.map((feature) => {
      const taskId = feature.properties?.id as number | undefined
      if (taskId == null) return feature

      const isHighlighted = taskId === primaryTaskId || bundleTaskIds.has(taskId)
      const isSelected = taskId === selectedTaskId
      const isLassoSelected = lassoSelectedTaskIds.has(taskId)

      return {
        ...feature,
        properties: {
          ...feature.properties,
          isHighlighted,
          isSelected,
          isLassoSelected,
        },
      }
    })

    return {
      type: 'FeatureCollection' as const,
      features: styledFeatures,
    } as GeoJSON.FeatureCollection
  }, [geoJSONData, primaryTaskId, activeBundle, selectedTaskId, lassoSelectedTaskIds])

  return (
    <Source
      id={LAYER_IDS.source}
      type="geojson"
      data={styledGeoJSONData}
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
