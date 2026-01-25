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
  lassoSelectedTaskIds?: Set<number>
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
  lassoSelectedTaskIds = new Set(),
}: UnclusteredSourceProps) => {
  const cachedGeoJSONRef = useRef<GeoJSON.FeatureCollection | null>(null)
  const previousHighlightedTaskIdsRef = useRef<Set<number>>(new Set())
  const previousSelectedTaskIdRef = useRef<number | null>(null)
  const previousLassoSelectedRef = useRef<Set<number>>(new Set())
  const sourceInitializedRef = useRef(false)
  const taskIdToFeatureRef = useRef<Map<number, GeoJSON.Feature>>(new Map())

  // Create or update cached GeoJSON - only recreate when marker data changes
  const cachedGeoJSON = useMemo(() => {
    // Filter out spidered markers from the regular layer
    const filteredFeatures = geoJSONData.features.filter((feature) => {
      const taskId = feature.properties?.id as number | undefined
      return taskId == null || !spideredMarkers.has(taskId)
    })

    // Compute highlighted task IDs
    const bundleTaskIds = new Set(activeBundle?.taskIds ?? [])
    const highlightedTaskIds = new Set<number>()
    if (primaryTaskId != null) {
      highlightedTaskIds.add(primaryTaskId)
    }
    bundleTaskIds.forEach((id) => highlightedTaskIds.add(id))

    // Build taskId to feature map for O(1) lookups
    const taskIdMap = new Map<number, GeoJSON.Feature>()
    const features = filteredFeatures.map((feature) => {
      const taskId = feature.properties?.id as number | undefined
      const isHighlighted = taskId != null && highlightedTaskIds.has(taskId)
      const isSelected = taskId === selectedTaskId
      const isLassoSelected = taskId != null && lassoSelectedTaskIds.has(taskId)
      const cachedFeature: GeoJSON.Feature = {
        ...feature,
        properties: {
          ...feature.properties,
          isHighlighted,
          isSelected,
          isLassoSelected,
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
    previousHighlightedTaskIdsRef.current = new Set(highlightedTaskIds)
    previousSelectedTaskIdRef.current = selectedTaskId ?? null
    previousLassoSelectedRef.current = new Set(lassoSelectedTaskIds)

    return cachedGeoJSONRef.current
  }, [geoJSONData, spideredMarkers, primaryTaskId, activeBundle, selectedTaskId, lassoSelectedTaskIds])

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
    const prevLassoSelected = previousLassoSelectedRef.current

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

    // Update lasso-selected tasks
    // Add newly lasso-selected
    for (const taskId of lassoSelectedTaskIds) {
      if (!prevLassoSelected.has(taskId)) {
        const feature = taskIdMap.get(taskId)
        if (feature?.properties) {
          feature.properties.isLassoSelected = true
          needsUpdate = true
        }
      }
    }
    // Remove no longer lasso-selected
    for (const taskId of prevLassoSelected) {
      if (!lassoSelectedTaskIds.has(taskId)) {
        const feature = taskIdMap.get(taskId)
        if (feature?.properties) {
          feature.properties.isLassoSelected = false
          needsUpdate = true
        }
      }
    }
    previousLassoSelectedRef.current = new Set(lassoSelectedTaskIds)

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
  }, [mapRef, primaryTaskId, activeBundle?.taskIds.join(','), selectedTaskId, lassoSelectedTaskIds])

  return (
    <Source id={LAYER_IDS.source} type="geojson" data={cachedGeoJSON}>
      <Layer {...unclusteredPointLayer} />
    </Source>
  )
}
