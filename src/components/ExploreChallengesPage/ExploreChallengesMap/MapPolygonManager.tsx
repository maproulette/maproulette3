import { useCallback, useEffect, useRef } from 'react'
import { removeLayer, removeSource } from '@/utils/mapUtils'
import { useExploreChallengesSearchContext } from '../ExploreChallengesSearchContext'
import type { PlaceDetail } from '../hooks/useLocationSearch'
import { useExploreChallengesMapContext } from './ExploreChallengesMapContext'

type GeoJSONGeometry = PlaceDetail['geojson']

const POLYGON_SOURCE_ID = 'location-polygon'
const POLYGON_FILL_LAYER_ID = 'location-polygon-fill'
const POLYGON_OUTLINE_LAYER_ID = 'location-polygon-outline'

const POLYGON_STYLE = {
  fill: {
    color: '#10b981',
    opacity: 0.15,
  },
  outline: {
    color: '#10b981',
    width: 2.5,
    dasharray: [3, 2] as [number, number],
  },
}

/**
 * Shared helper to add polygon layers to the map
 * Used by both addPolygonToMap and restorePolygon to eliminate code duplication
 */
const addPolygonLayers = (
  mapInstance: maplibregl.Map,
  geojson: NonNullable<GeoJSONGeometry>
): void => {
  const feature = {
    type: 'Feature' as const,
    geometry: geojson,
    properties: {},
  }

  mapInstance.addSource(POLYGON_SOURCE_ID, {
    type: 'geojson',
    data: feature,
  })

  mapInstance.addLayer({
    id: POLYGON_FILL_LAYER_ID,
    type: 'fill',
    source: POLYGON_SOURCE_ID,
    paint: {
      'fill-color': POLYGON_STYLE.fill.color,
      'fill-opacity': POLYGON_STYLE.fill.opacity,
    },
  })

  mapInstance.addLayer({
    id: POLYGON_OUTLINE_LAYER_ID,
    type: 'line',
    source: POLYGON_SOURCE_ID,
    paint: {
      'line-color': POLYGON_STYLE.outline.color,
      'line-width': POLYGON_STYLE.outline.width,
      'line-dasharray': POLYGON_STYLE.outline.dasharray,
    },
  })
}

/**
 * Component to manage location polygon on a map
 * Handles adding, removing, and restoring polygon layers when map style changes
 */
export const MapPolygonManager = () => {
  const { map, mapLoaded } = useExploreChallengesMapContext()
  const { locationGeojson } = useExploreChallengesSearchContext()
  const currentGeojsonRef = useRef<GeoJSONGeometry | null>(null)
  const isRestoringRef = useRef(false)
  const pendingGeojsonRef = useRef<GeoJSONGeometry | null>(null)
  const styleCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const styleCheckTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cleanupAllLayers = useCallback(() => {
    if (!map.current) return

    removeLayer(map.current, POLYGON_OUTLINE_LAYER_ID)
    removeLayer(map.current, POLYGON_FILL_LAYER_ID)
    removeSource(map.current, POLYGON_SOURCE_ID)
  }, [map])

  const clearStyleCheckTimers = useCallback(() => {
    if (styleCheckIntervalRef.current) {
      clearInterval(styleCheckIntervalRef.current)
      styleCheckIntervalRef.current = null
    }
    if (styleCheckTimeoutRef.current) {
      clearTimeout(styleCheckTimeoutRef.current)
      styleCheckTimeoutRef.current = null
    }
  }, [])

  const addPolygonToMap = useCallback(
    (geojson: GeoJSONGeometry) => {
      if (!map.current || !mapLoaded || !geojson) return

      cleanupAllLayers()
      addPolygonLayers(map.current, geojson)
      currentGeojsonRef.current = geojson
    },
    [map, mapLoaded, cleanupAllLayers]
  )

  const addPolygon = useCallback(
    (geojson: GeoJSONGeometry) => {
      if (!geojson) return

      if (map.current && mapLoaded) {
        addPolygonToMap(geojson)
      } else {
        pendingGeojsonRef.current = geojson
      }
    },
    [map, mapLoaded, addPolygonToMap]
  )

  const removePolygon = useCallback(() => {
    cleanupAllLayers()
    clearStyleCheckTimers()
    currentGeojsonRef.current = null
    pendingGeojsonRef.current = null
  }, [cleanupAllLayers, clearStyleCheckTimers])

  // Handle pending polygon when map loads
  useEffect(() => {
    if (pendingGeojsonRef.current && map.current && mapLoaded) {
      addPolygonToMap(pendingGeojsonRef.current)
      pendingGeojsonRef.current = null
    }
  }, [map, mapLoaded, addPolygonToMap])

  // Handle style changes to restore polygon
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    const restorePolygon = (geojson: GeoJSONGeometry) => {
      if (!map.current || !geojson) return

      isRestoringRef.current = true
      cleanupAllLayers()

      try {
        addPolygonLayers(map.current, geojson)
      } catch (error) {
        console.error('Error restoring polygon:', error)
      } finally {
        setTimeout(() => {
          isRestoringRef.current = false
        }, 200)
      }
    }

    const handleStyleData = (e: maplibregl.MapDataEvent) => {
      if (isRestoringRef.current) return
      if (e.dataType !== 'style') return

      const geojson = currentGeojsonRef.current
      if (!geojson || !map.current) return
      if (map.current.getSource(POLYGON_SOURCE_ID)) return

      clearStyleCheckTimers()

      if (!map.current.isStyleLoaded()) {
        styleCheckIntervalRef.current = setInterval(() => {
          if (map.current?.isStyleLoaded()) {
            clearStyleCheckTimers()
            restorePolygon(geojson)
          }
        }, 50)

        styleCheckTimeoutRef.current = setTimeout(() => {
          clearStyleCheckTimers()
        }, 2000)
      } else {
        restorePolygon(geojson)
      }
    }

    map.current.on('styledata', handleStyleData)

    return () => {
      map.current?.off('styledata', handleStyleData)
      clearStyleCheckTimers()
    }
  }, [map, mapLoaded, cleanupAllLayers, clearStyleCheckTimers])

  // Handle locationGeojson changes and initial restoration
  useEffect(() => {
    if (!mapLoaded) return

    if (locationGeojson) {
      addPolygon(locationGeojson)
    } else {
      removePolygon()
    }
  }, [mapLoaded, locationGeojson, addPolygon, removePolygon])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      removePolygon()
    }
  }, [removePolygon])

  return null
}
