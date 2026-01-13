import type maplibregl from 'maplibre-gl'
import { useEffect, useRef } from 'react'
import { ensureClusterCountAboveClusters } from '@/components/shared/TaskMarkers/addMapLayers'
import { useTaskMapContext } from '../contexts/TaskMapContext'
import { attachEventHandlers, removeEventHandlers } from './osmEventHandlers'
import { addHighlightLayers, buildLayerConfigs } from './osmLayerConfig'
import { findTargetLayerId, repositionOSMLayers } from './osmLayerPositioning'
import { parseOSMXML } from './osmParser'

interface OSMDataLayerProps {
  xmlData: Document | null
  showOSMElements: {
    nodes: boolean
    ways: boolean
    areas: boolean
  }
  elementOrder?: ('nodes' | 'ways' | 'areas')[]
  dataLayerOrder?: ('task-features' | 'osm-data')[]
}

const SOURCE_ID = 'osm-data'

// Helper functions
const removeLayers = (map: maplibregl.Map, layerIds: string[]): void => {
  layerIds.forEach((id) => {
    if (map.getLayer(id)) {
      map.removeLayer(id)
    }
  })
}

const clearFeatureStates = (
  map: maplibregl.Map,
  sourceId: string,
  featureIds: Set<string>,
  state: { hover: boolean; selected: boolean }
): void => {
  featureIds.forEach((id) => {
    try {
      map.setFeatureState({ source: sourceId, id }, state)
    } catch {
      // Ignore errors
    }
  })
}

const filterFeaturesByType = (
  features: GeoJSON.Feature[],
  showOSMElements: { nodes: boolean; ways: boolean; areas: boolean }
): GeoJSON.Feature[] => {
  return features.filter((feature) => {
    const type = feature.properties?.type
    if (type === 'node') return showOSMElements.nodes
    if (type === 'way') return showOSMElements.ways
    if (type === 'area') return showOSMElements.areas
    return true
  })
}

export const OSMDataLayer = ({
  xmlData,
  showOSMElements,
  elementOrder = ['ways', 'areas', 'nodes'],
  dataLayerOrder = ['task-features', 'osm-data'],
}: OSMDataLayerProps) => {
  const { map, mapLoaded } = useTaskMapContext()
  const layersRef = useRef<string[]>([])
  const currentPopupRef = useRef<maplibregl.Popup | null>(null)
  const highlightedFeatureIdsRef = useRef<Set<string>>(new Set())
  const hoveredFeatureIdsRef = useRef<Set<string>>(new Set())
  const eventHandlerTimeoutRef = useRef<number | null>(null)
  const mapClickHandlerRef = useRef<((e: maplibregl.MapMouseEvent) => void) | null>(null)
  const mapMouseMoveHandlerRef = useRef<((e: maplibregl.MapMouseEvent) => void) | null>(null)

  useEffect(() => {
    if (!map.current || !mapLoaded || !xmlData) {
      if (map.current) {
        removeLayers(map.current, layersRef.current)
        layersRef.current = []
        if (map.current.getSource(SOURCE_ID)) {
          map.current.removeSource(SOURCE_ID)
        }
      }
      return
    }

    const existingLayers = layersRef.current.filter((id) => map.current?.getLayer(id))
    const shouldRepositionOnly = existingLayers.length > 0 && map.current.getSource(SOURCE_ID)

    if (shouldRepositionOnly) {
      repositionOSMLayers(map.current, existingLayers, dataLayerOrder)
      return
    }

    try {
      const geoJsonData = parseOSMXML(xmlData)
      const filteredGeoJson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: filterFeaturesByType(geoJsonData.features, showOSMElements),
      }

      removeLayers(map.current, layersRef.current)
      layersRef.current = []

      if (map.current.getSource(SOURCE_ID)) {
        map.current.removeSource(SOURCE_ID)
      }

      map.current.addSource(SOURCE_ID, {
        type: 'geojson',
        data: filteredGeoJson,
        promoteId: 'id',
      })

      const layerConfigs = buildLayerConfigs(SOURCE_ID, elementOrder, showOSMElements)
      const beforeLayerId = findTargetLayerId(map.current, dataLayerOrder)

      layerConfigs.forEach((layerConfig) => {
        if (!map.current) return
        try {
          map.current.addLayer(layerConfig.config, beforeLayerId)
          layersRef.current.push(layerConfig.id)
        } catch (error) {
          console.warn(`Failed to add OSM layer ${layerConfig.id}:`, error)
        }
      })

      addHighlightLayers(map.current, SOURCE_ID, showOSMElements, beforeLayerId, layersRef)

      // Ensure cluster count is above cluster circle after adding OSM layers
      // Use a small delay to ensure all layers are fully added
      setTimeout(() => {
        if (map.current) {
          ensureClusterCountAboveClusters(map.current)
        }
      }, 50)

      attachEventHandlers(
        map.current,
        {
          map,
          sourceId: SOURCE_ID,
          layersRef,
          currentPopupRef,
          highlightedFeatureIdsRef,
          hoveredFeatureIdsRef,
        },
        eventHandlerTimeoutRef,
        mapClickHandlerRef,
        mapMouseMoveHandlerRef
      )
    } catch (error) {
      console.error('Error rendering OSM data layer:', error)
    }

    return () => {
      if (eventHandlerTimeoutRef.current !== null) {
        clearTimeout(eventHandlerTimeoutRef.current)
        eventHandlerTimeoutRef.current = null
      }

      if (!map.current) return

      removeEventHandlers(
        map.current,
        {
          map,
          sourceId: SOURCE_ID,
          layersRef,
          currentPopupRef,
          highlightedFeatureIdsRef,
          hoveredFeatureIdsRef,
        },
        mapClickHandlerRef,
        mapMouseMoveHandlerRef
      )

      clearFeatureStates(map.current, SOURCE_ID, highlightedFeatureIdsRef.current, {
        hover: false,
        selected: false,
      })
      highlightedFeatureIdsRef.current.clear()

      clearFeatureStates(map.current, SOURCE_ID, hoveredFeatureIdsRef.current, {
        hover: false,
        selected: false,
      })
      hoveredFeatureIdsRef.current.clear()

      removeLayers(map.current, layersRef.current)
      layersRef.current = []

      if (currentPopupRef.current) {
        currentPopupRef.current.remove()
        currentPopupRef.current = null
      }

      if (map.current.getSource(SOURCE_ID)) {
        map.current.removeSource(SOURCE_ID)
      }
    }
  }, [map, mapLoaded, xmlData, showOSMElements, elementOrder, dataLayerOrder])

  return null
}
