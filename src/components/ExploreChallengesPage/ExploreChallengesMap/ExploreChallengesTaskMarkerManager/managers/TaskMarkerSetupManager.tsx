import type maplibregl from 'maplibre-gl'
import { useEffect, useRef } from 'react'
import { addMapLayers } from '../addMapLayers'
import { CLUSTER_CONFIG, LAYER_IDS } from '../const'
import { createMarkerIcons } from '../createMarkerIcons'
import { setupEventListeners } from '../eventListeners'
import { cleanupLayers, cleanupPopups } from '../utils/mapCleanup'

interface TaskMarkerSetupManagerProps {
  map: React.RefObject<maplibregl.Map | null>
  mapLoaded: boolean
  isLoading: boolean
  styleId: string
  clusteringEnabled: boolean
  useTaskCountFilter: boolean
  initialData?: GeoJSON.FeatureCollection | null
}

const getExistingData = (source: maplibregl.GeoJSONSource): GeoJSON.FeatureCollection | null => {
  const data = source._data
  if (
    data &&
    typeof data === 'object' &&
    'features' in data &&
    Array.isArray(data.features) &&
    data.features.length > 0
  ) {
    return data as GeoJSON.FeatureCollection
  }
  return null
}

const createSourceConfig = (
  data: GeoJSON.FeatureCollection,
  clusteringEnabled: boolean,
  useTaskCountFilter: boolean
) => {
  const useClientSideClustering = clusteringEnabled && !useTaskCountFilter
  const config: {
    type: 'geojson'
    data: GeoJSON.FeatureCollection
    promoteId: string
    cluster?: boolean
    clusterMaxZoom?: number
    clusterRadius?: number
    clusterProperties?: Record<string, unknown[]>
  } = {
    type: 'geojson',
    data,
    promoteId: 'id',
  }

  if (useClientSideClustering) {
    config.cluster = true
    config.clusterMaxZoom = CLUSTER_CONFIG.maxZoom
    config.clusterRadius = CLUSTER_CONFIG.radius
    if (useTaskCountFilter) {
      config.clusterProperties = {
        // biome-ignore lint/suspicious/noExplicitAny: Mapbox expression types are too strict
        taskCount: ['+', ['get', 'taskCount']] as any,
      }
    }
  }

  return { config, useClientSideClustering }
}

export const TaskMarkerSetupManager = ({
  map,
  mapLoaded,
  isLoading,
  styleId,
  clusteringEnabled,
  useTaskCountFilter,
  initialData,
}: TaskMarkerSetupManagerProps) => {
  const prevStateRef = useRef({ styleId, clusteringEnabled, useTaskCountFilter })
  const eventListenerCleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!map.current || !mapLoaded || isLoading) return

    const prev = prevStateRef.current
    const styleChanged = prev.styleId !== styleId
    const clusteringChanged =
      prev.clusteringEnabled !== clusteringEnabled || prev.useTaskCountFilter !== useTaskCountFilter

    const setupMarkers = () => {
      if (!map.current?.isStyleLoaded()) {
        requestAnimationFrame(setupMarkers)
        return
      }

      eventListenerCleanupRef.current?.()
      eventListenerCleanupRef.current = null

      createMarkerIcons(map)

      const existingSource = map.current.getSource(LAYER_IDS.source) as
        | maplibregl.GeoJSONSource
        | undefined

      if (existingSource && !styleChanged && !clusteringChanged) {
        eventListenerCleanupRef.current = setupEventListeners(map, LAYER_IDS)
        return
      }

      const existingData = existingSource ? getExistingData(existingSource) : null
      const sourceData = existingData ||
        initialData || { type: 'FeatureCollection' as const, features: [] }

      if (existingSource) {
        cleanupLayers(map.current)
      }

      if ((styleChanged || clusteringChanged) && map.current) {
        cleanupPopups(map.current)
      }

      const { config, useClientSideClustering } = createSourceConfig(
        sourceData,
        clusteringEnabled,
        useTaskCountFilter
      )

      const currentSource = map.current.getSource(LAYER_IDS.source)
      if (currentSource) {
        try {
          map.current.removeSource(LAYER_IDS.source)
        } catch {}
      }

      try {
        map.current.addSource(LAYER_IDS.source, config)
      } catch (error) {
        const source = map.current.getSource(LAYER_IDS.source) as
          | maplibregl.GeoJSONSource
          | undefined
        if (source) {
          source.setData(sourceData)
        } else {
          console.error('Failed to add or update source:', error)
          return
        }
      }

      if (!map.current.getSource(LAYER_IDS.source)) {
        console.error('Source was not created successfully')
        return
      }

      addMapLayers(map, {
        useTaskCountFilter,
        clientSideClustering: useClientSideClustering,
        clusteringEnabled,
      })

      requestAnimationFrame(() => {
        if (map.current) {
          eventListenerCleanupRef.current = setupEventListeners(map, LAYER_IDS)
        }
      })

      prevStateRef.current = { styleId, clusteringEnabled, useTaskCountFilter }
    }

    setupMarkers()

    const handleStyleLoad = () => setupMarkers()
    map.current.on('style.load', handleStyleLoad)

    return () => {
      map.current?.off('style.load', handleStyleLoad)
      eventListenerCleanupRef.current?.()
    }
  }, [map, mapLoaded, isLoading, styleId, clusteringEnabled, useTaskCountFilter, initialData])

  return null
}
