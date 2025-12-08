import type maplibregl from 'maplibre-gl'
import { useCallback, useEffect, useRef } from 'react'
import { removeLayer, removeSource } from '@/utils/mapUtils'
import type { PlaceDetail } from './useLocationSearch'

type GeoJSONGeometry = PlaceDetail['geojson']

const POLYGON_SOURCE_ID = 'location-polygon'
const POLYGON_FILL_LAYER_ID = 'location-polygon-fill'
const POLYGON_OUTLINE_LAYER_ID = 'location-polygon-outline'

// Legacy layer IDs for cleanup
const BBOX_SOURCE_ID = 'location-bbox'
const BBOX_FILL_LAYER_ID = 'location-bbox-fill'
const BBOX_OUTLINE_LAYER_ID = 'location-bbox-outline'

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

interface UseMapPolygonOptions {
  map: React.RefObject<maplibregl.Map | null>
  mapLoaded: boolean
}

interface UseMapPolygonReturn {
  addPolygon: (geojson: GeoJSONGeometry) => void
  removePolygon: () => void
  currentGeojson: GeoJSONGeometry | null
}

export const useMapPolygon = ({ map, mapLoaded }: UseMapPolygonOptions): UseMapPolygonReturn => {
  const currentGeojsonRef = useRef<GeoJSONGeometry | null>(null)
  const isRestoringRef = useRef(false)
  const pendingGeojsonRef = useRef<GeoJSONGeometry | null>(null)

  const cleanupAllLayers = useCallback(() => {
    if (!map.current) return

    removeLayer(map.current, POLYGON_OUTLINE_LAYER_ID)
    removeLayer(map.current, POLYGON_FILL_LAYER_ID)
    removeSource(map.current, POLYGON_SOURCE_ID)

    removeLayer(map.current, BBOX_OUTLINE_LAYER_ID)
    removeLayer(map.current, BBOX_FILL_LAYER_ID)
    removeSource(map.current, BBOX_SOURCE_ID)
  }, [map])

  const addPolygonToMap = useCallback(
    (geojson: GeoJSONGeometry) => {
      if (!map.current || !mapLoaded || !geojson) return

      cleanupAllLayers()

      const feature = {
        type: 'Feature' as const,
        geometry: geojson,
        properties: {},
      }

      map.current.addSource(POLYGON_SOURCE_ID, {
        type: 'geojson',
        data: feature,
      })

      map.current.addLayer({
        id: POLYGON_FILL_LAYER_ID,
        type: 'fill',
        source: POLYGON_SOURCE_ID,
        paint: {
          'fill-color': POLYGON_STYLE.fill.color,
          'fill-opacity': POLYGON_STYLE.fill.opacity,
        },
      })

      map.current.addLayer({
        id: POLYGON_OUTLINE_LAYER_ID,
        type: 'line',
        source: POLYGON_SOURCE_ID,
        paint: {
          'line-color': POLYGON_STYLE.outline.color,
          'line-width': POLYGON_STYLE.outline.width,
          'line-dasharray': POLYGON_STYLE.outline.dasharray,
        },
      })

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
    currentGeojsonRef.current = null
    pendingGeojsonRef.current = null
  }, [cleanupAllLayers])

  useEffect(() => {
    if (pendingGeojsonRef.current && map.current && mapLoaded) {
      addPolygonToMap(pendingGeojsonRef.current)
      pendingGeojsonRef.current = null
    }
  }, [map, mapLoaded, addPolygonToMap])

  useEffect(() => {
    if (!map.current || !mapLoaded) return

    const restorePolygon = (geojson: GeoJSONGeometry) => {
      if (!map.current || !geojson) return

      isRestoringRef.current = true

      cleanupAllLayers()

      const feature = {
        type: 'Feature' as const,
        geometry: geojson,
        properties: {},
      }

      try {
        map.current.addSource(POLYGON_SOURCE_ID, {
          type: 'geojson',
          data: feature,
        })

        map.current.addLayer({
          id: POLYGON_FILL_LAYER_ID,
          type: 'fill',
          source: POLYGON_SOURCE_ID,
          paint: {
            'fill-color': POLYGON_STYLE.fill.color,
            'fill-opacity': POLYGON_STYLE.fill.opacity,
          },
        })

        map.current.addLayer({
          id: POLYGON_OUTLINE_LAYER_ID,
          type: 'line',
          source: POLYGON_SOURCE_ID,
          paint: {
            'line-color': POLYGON_STYLE.outline.color,
            'line-width': POLYGON_STYLE.outline.width,
            'line-dasharray': POLYGON_STYLE.outline.dasharray,
          },
        })
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

      if (!map.current.isStyleLoaded()) {
        const checkStyle = setInterval(() => {
          if (map.current?.isStyleLoaded()) {
            clearInterval(checkStyle)
            restorePolygon(geojson)
          }
        }, 0)
        setTimeout(() => clearInterval(checkStyle), 2000)
      } else {
        restorePolygon(geojson)
      }
    }

    map.current.on('styledata', handleStyleData)

    return () => {
      map.current?.off('styledata', handleStyleData)
    }
  }, [map, mapLoaded, cleanupAllLayers])

  useEffect(() => {
    return () => {
      removePolygon()
    }
  }, [removePolygon])

  return {
    addPolygon,
    removePolygon,
    currentGeojson: currentGeojsonRef.current,
  }
}
