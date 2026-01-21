import { useEffect, useMemo, useRef } from 'react'
import type { GeoJSONSource } from 'maplibre-gl'
import type maplibregl from 'maplibre-gl'
import { Layer, Source } from 'react-map-gl/maplibre'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import { unclusteredPointLayer } from './clusterLayers'

interface UnclusteredSourceProps {
  geoJSONData: GeoJSON.FeatureCollection
  showBundleOnly?: boolean
  primaryTaskId: number
  activeBundle?: { bundleId: number; taskIds: number[] } | null
  mapRef?: React.RefObject<{ getMap: () => maplibregl.Map | null } | null>
}

/**
 * Renders unclustered markers using MapLibre's native layer-based rendering.
 * Uses setData for efficient updates when bundle state changes, avoiding source recreation.
 */
export const UnclusteredSource = ({
  geoJSONData,
  showBundleOnly = false,
  primaryTaskId,
  activeBundle,
  mapRef,
}: UnclusteredSourceProps) => {
  const baseGeoJSONRef = useRef<GeoJSON.FeatureCollection | null>(null)
  const bundleTaskIdsRef = useRef<string>('')
  const sourceInitializedRef = useRef(false)

  // Create base GeoJSON without highlight properties - only recalculate when markers change
  const baseGeoJSON = useMemo(() => {
    // Only update base if the feature count or IDs changed (new markers loaded)
    const currentFeatureIds = geoJSONData.features
      .map((f) => f.properties?.id)
      .filter(Boolean)
      .join(',')
    const prevFeatureIds = baseGeoJSONRef.current?.features
      .map((f) => f.properties?.id)
      .filter(Boolean)
      .join(',')

    if (
      !baseGeoJSONRef.current ||
      currentFeatureIds !== prevFeatureIds ||
      geoJSONData.features.length !== baseGeoJSONRef.current.features.length
    ) {
      baseGeoJSONRef.current = {
        ...geoJSONData,
        features: geoJSONData.features.map((feature) => ({
          ...feature,
          properties: {
            ...feature.properties,
            // Initialize highlight properties
            isHighlighted: false,
            isSelected: false,
            isHovered: false,
            isOverlapping: false,
          },
        })),
      }
      sourceInitializedRef.current = false // Reset flag when base data changes
    }
    return baseGeoJSONRef.current
  }, [geoJSONData])

  // Function to update highlights efficiently
  const updateHighlights = useMemo(() => {
    return (source: GeoJSONSource) => {
      if (!baseGeoJSONRef.current) return

      // Update only the highlight properties without recreating the entire source
      const updatedFeatures = baseGeoJSONRef.current.features.map((feature) => {
        const taskId = feature.properties?.id as number | undefined
        const isPrimary = taskId === primaryTaskId
        const isBundled = activeBundle?.taskIds.includes(taskId ?? -1) ?? false
        const isHighlighted = isPrimary || isBundled

        return {
          ...feature,
          properties: {
            ...feature.properties,
            isHighlighted,
            // Keep other properties
            isSelected: feature.properties?.isSelected ?? false,
            isHovered: feature.properties?.isHovered ?? false,
            isOverlapping: feature.properties?.isOverlapping ?? false,
          },
        }
      })

      // Use setData for efficient update - MapLibre will batch and optimize the update
      source.setData({
        type: 'FeatureCollection',
        features: updatedFeatures,
      })
    }
  }, [primaryTaskId, activeBundle?.taskIds.join(',')])

  // Update highlights when bundle changes or source becomes available
  useEffect(() => {
    if (!mapRef?.current) return

    const map = mapRef.current.getMap()
    if (!map) return

    const source = map.getSource(LAYER_IDS.source) as GeoJSONSource | undefined
    if (!source) return

    // Initialize source with base data if needed
    if (!sourceInitializedRef.current && baseGeoJSONRef.current) {
      source.setData(baseGeoJSONRef.current)
      sourceInitializedRef.current = true
    }

    // Only update if bundle actually changed
    const currentBundleIds = activeBundle?.taskIds.join(',') ?? ''
    if (currentBundleIds === bundleTaskIdsRef.current && sourceInitializedRef.current) return
    bundleTaskIdsRef.current = currentBundleIds

    // Update highlights
    updateHighlights(source)
  }, [mapRef, updateHighlights, activeBundle?.taskIds.join(',')])

  // Initial data for Source component - will be updated via setData after mount
  const initialGeoJSON = useMemo(() => {
    if (!baseGeoJSON) return geoJSONData
    return baseGeoJSON
  }, [baseGeoJSON, geoJSONData])

  return (
    <Source id={LAYER_IDS.source} type="geojson" data={initialGeoJSON}>
      <Layer {...unclusteredPointLayer} />
    </Source>
  )
}

