import type { GeoJSONSource } from 'maplibre-gl'
import type maplibregl from 'maplibre-gl'
import { useEffect, useMemo, useRef } from 'react'
import { Layer, Source } from 'react-map-gl/maplibre'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import { unclusteredPointLayer } from './clusterLayers'

interface UnclusteredSourceProps {
  geoJSONData: GeoJSON.FeatureCollection
  showBundleOnly?: boolean
  primaryTaskId: number
  activeBundle?: { bundleId: number; taskIds: number[] } | null
  mapRef?: React.RefObject<{ getMap: () => maplibregl.Map | null } | null>
  spideredMarkers?: Map<number, { original: [number, number]; spidered: [number, number] }>
  selectedTaskId?: number | null
}

/**
 * Renders unclustered markers using MapLibre's native layer-based rendering.
 * Uses a cached GeoJSON that is directly mutated for fast updates without
 * object recreation.
 */
export const UnclusteredSource = ({
  geoJSONData,
  showBundleOnly: _showBundleOnly, // Filtering happens in hooks.ts before data reaches here
  primaryTaskId,
  activeBundle,
  mapRef,
  spideredMarkers = new Map(),
  selectedTaskId,
}: UnclusteredSourceProps) => {
  const cachedGeoJSONRef = useRef<GeoJSON.FeatureCollection | null>(null)
  const previousHighlightedTaskIdsRef = useRef<Set<number>>(new Set())
  const previousSelectedTaskIdRef = useRef<number | null>(null)
  const sourceInitializedRef = useRef(false)
  const taskIdToFeatureRef = useRef<Map<number, GeoJSON.Feature>>(new Map())

  // Create or update cached GeoJSON - only recreate when marker data changes
  const cachedGeoJSON = useMemo(() => {
    // Filter out spidered markers from the regular layer
    const filteredFeatures = geoJSONData.features.filter((feature) => {
      const taskId = feature.properties?.id as number | undefined
      return taskId == null || !spideredMarkers.has(taskId)
    })

    // Create a simple hash to detect if features changed
    const featureIds = filteredFeatures
      .map((f) => f.properties?.id)
      .filter(Boolean)
      .sort((a, b) => (a as number) - (b as number))
      .join(',')

    const prevFeatureIds = cachedGeoJSONRef.current?.features
      .map((f) => f.properties?.id)
      .filter(Boolean)
      .sort((a, b) => (a as number) - (b as number))
      .join(',')

    // Only recreate cache if features actually changed
    if (!cachedGeoJSONRef.current || featureIds !== prevFeatureIds) {
      // Build taskId to feature map for O(1) lookups
      const taskIdMap = new Map<number, GeoJSON.Feature>()
      const features = filteredFeatures.map((feature) => {
        const taskId = feature.properties?.id as number | undefined
        const isSelected = taskId === selectedTaskId
        const cachedFeature: GeoJSON.Feature = {
          ...feature,
          properties: {
            ...feature.properties,
            // Initialize highlight properties
            isHighlighted: false,
            isSelected: isSelected,
            isHovered: feature.properties?.isHovered ?? false,
            isOverlapping: feature.properties?.isOverlapping ?? false,
          },
        }

        if (taskId != null) {
          taskIdMap.set(taskId, cachedFeature)
        }

        return cachedFeature
      })

      cachedGeoJSONRef.current = {
        type: 'FeatureCollection',
        features,
      }
      taskIdToFeatureRef.current = taskIdMap
      sourceInitializedRef.current = false
      previousHighlightedTaskIdsRef.current.clear()
      previousSelectedTaskIdRef.current = selectedTaskId ?? null
    }

    return cachedGeoJSONRef.current
  }, [geoJSONData, spideredMarkers, selectedTaskId])

  // Update cached layer directly for fast updates
  useEffect(() => {
    if (!mapRef?.current) return

    const map = mapRef.current.getMap()
    if (!map) return

    const source = map.getSource(LAYER_IDS.source) as GeoJSONSource | undefined
    if (!source || !cachedGeoJSONRef.current) return

    // Initialize source with cached data if needed
    if (!sourceInitializedRef.current) {
      source.setData(cachedGeoJSONRef.current)
      sourceInitializedRef.current = true
    }

    // Calculate which tasks should be highlighted
    const bundleTaskIds = new Set(activeBundle?.taskIds ?? [])
    const highlightedTaskIds = new Set<number>()

    // Primary task is always highlighted
    if (primaryTaskId != null) {
      highlightedTaskIds.add(primaryTaskId)
    }

    // Add bundled tasks
    bundleTaskIds.forEach((id) => highlightedTaskIds.add(id))

    // Check if anything actually changed
    const prevHighlighted = previousHighlightedTaskIdsRef.current
    const prevSelected = previousSelectedTaskIdRef.current

    // Directly mutate cached features - no object recreation
    const taskIdMap = taskIdToFeatureRef.current
    let needsUpdate = false

    // Update selected task
    if (selectedTaskId !== prevSelected) {
      // Clear previous selected
      if (prevSelected != null) {
        const prevFeature = taskIdMap.get(prevSelected)
        if (prevFeature?.properties) {
          prevFeature.properties.isSelected = false
          needsUpdate = true
        }
      }
      // Set new selected
      if (selectedTaskId != null) {
        const selectedFeature = taskIdMap.get(selectedTaskId)
        if (selectedFeature?.properties) {
          selectedFeature.properties.isSelected = true
          needsUpdate = true
        }
      }
      previousSelectedTaskIdRef.current = selectedTaskId ?? null
    }

    // Update features that should be highlighted
    for (const taskId of highlightedTaskIds) {
      if (!prevHighlighted.has(taskId)) {
        const feature = taskIdMap.get(taskId)
        if (feature?.properties) {
          feature.properties.isHighlighted = true
          needsUpdate = true
        }
      }
    }

    // Update features that should no longer be highlighted
    for (const taskId of prevHighlighted) {
      if (!highlightedTaskIds.has(taskId)) {
        const feature = taskIdMap.get(taskId)
        if (feature?.properties) {
          feature.properties.isHighlighted = false
          needsUpdate = true
        }
      }
    }

    // Only call setData if something changed - MapLibre will efficiently update
    if (needsUpdate && cachedGeoJSONRef.current) {
      source.setData(cachedGeoJSONRef.current)
    }

    previousHighlightedTaskIdsRef.current = new Set(highlightedTaskIds)
  }, [mapRef, primaryTaskId, activeBundle?.taskIds.join(','), selectedTaskId])

  return (
    <Source id={LAYER_IDS.source} type="geojson" data={cachedGeoJSON}>
      <Layer {...unclusteredPointLayer} />
    </Source>
  )
}
