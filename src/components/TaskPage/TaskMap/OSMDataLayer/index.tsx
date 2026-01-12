import type maplibregl from 'maplibre-gl'
import { useEffect, useRef } from 'react'
import { useTaskMapContext } from '@/contexts/tasks/TaskMapContext'
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

export const OSMDataLayer = ({
  xmlData,
  showOSMElements,
  elementOrder = ['ways', 'areas', 'nodes'],
  dataLayerOrder = ['task-features', 'osm-data'],
}: OSMDataLayerProps) => {
  const { map, mapLoaded } = useTaskMapContext()
  const sourceId = 'osm-data'
  const layersRef = useRef<string[]>([])
  const currentPopupRef = useRef<maplibregl.Popup | null>(null)
  const highlightedFeatureIdsRef = useRef<Set<string>>(new Set())
  const hoveredFeatureIdRef = useRef<string | null>(null)
  const eventHandlerTimeoutRef = useRef<number | null>(null)
  const mapClickHandlerRef = useRef<((e: maplibregl.MapMouseEvent) => void) | null>(null)

  useEffect(() => {
    if (!map.current || !mapLoaded || !xmlData) {
      if (map.current) {
        layersRef.current.forEach((layerId) => {
          if (map.current?.getLayer(layerId)) {
            map.current.removeLayer(layerId)
          }
        })
        layersRef.current = []

        if (map.current.getSource(sourceId)) {
          map.current.removeSource(sourceId)
        }
      }
      return
    }

    const existingLayers = layersRef.current.filter((id) => map.current?.getLayer(id))
    const shouldRepositionOnly = existingLayers.length > 0 && map.current.getSource(sourceId)

    if (shouldRepositionOnly) {
      repositionOSMLayers(map.current, existingLayers, dataLayerOrder)
      return
    }

    try {
      const geoJsonData = parseOSMXML(xmlData)

      const filteredFeatures = geoJsonData.features.filter((feature) => {
        const type = feature.properties?.type
        if (type === 'node') return showOSMElements.nodes
        if (type === 'way') return showOSMElements.ways
        if (type === 'area') return showOSMElements.areas
        return true
      })

      const filteredGeoJson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: filteredFeatures,
      }

      layersRef.current.forEach((layerId) => {
        if (map.current?.getLayer(layerId)) {
          map.current.removeLayer(layerId)
        }
      })
      layersRef.current = []

      if (map.current.getSource(sourceId)) {
        map.current.removeSource(sourceId)
      }

      map.current.addSource(sourceId, {
        type: 'geojson',
        data: filteredGeoJson,
        promoteId: 'id',
      })

      const layerConfigs = buildLayerConfigs(sourceId, elementOrder, showOSMElements)

      const beforeLayerId = findTargetLayerId(map.current, dataLayerOrder)

      layerConfigs.forEach((layerConfig) => {
        if (!map.current) return
        try {
          if (beforeLayerId) {
            map.current.addLayer(layerConfig.config, beforeLayerId)
          } else {
            map.current.addLayer(layerConfig.config)
          }
          layersRef.current.push(layerConfig.id)
        } catch (error) {
          console.warn(`Failed to add OSM layer ${layerConfig.id}:`, error)
        }
      })

      addHighlightLayers(map.current, sourceId, showOSMElements, beforeLayerId, layersRef)

      const eventHandlerContext = {
        map,
        sourceId,
        layersRef,
        currentPopupRef,
        highlightedFeatureIdsRef,
        hoveredFeatureIdRef,
      }

      attachEventHandlers(
        map.current,
        eventHandlerContext,
        eventHandlerTimeoutRef,
        mapClickHandlerRef
      )
    } catch (error) {
      console.error('Error rendering OSM data layer:', error)
    }

    return () => {
      if (eventHandlerTimeoutRef.current !== null) {
        clearTimeout(eventHandlerTimeoutRef.current)
        eventHandlerTimeoutRef.current = null
      }

      if (map.current) {
        const eventHandlerContext = {
          map,
          sourceId,
          layersRef,
          currentPopupRef,
          highlightedFeatureIdsRef,
          hoveredFeatureIdRef,
        }
        removeEventHandlers(map.current, eventHandlerContext, mapClickHandlerRef)

        highlightedFeatureIdsRef.current.forEach((featureId) => {
          try {
            map.current?.setFeatureState(
              { source: sourceId, id: featureId },
              { hover: false, selected: false }
            )
          } catch {}
        })
        highlightedFeatureIdsRef.current.clear()

        layersRef.current.forEach((layerId) => {
          if (map.current?.getLayer(layerId)) {
            map.current.removeLayer(layerId)
          }
        })
        layersRef.current = []

        if (currentPopupRef.current) {
          currentPopupRef.current.remove()
          currentPopupRef.current = null
        }

        if (hoveredFeatureIdRef.current) {
          try {
            map.current.setFeatureState(
              { source: sourceId, id: hoveredFeatureIdRef.current },
              { hover: false }
            )
          } catch {}
          hoveredFeatureIdRef.current = null
        }

        if (map.current.getSource(sourceId)) {
          map.current.removeSource(sourceId)
        }
      }
    }
  }, [map, mapLoaded, xmlData, showOSMElements, elementOrder, dataLayerOrder])

  return null
}
