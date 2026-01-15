import 'maplibre-gl/dist/maplibre-gl.css'
import 'map-gl-style-switcher/dist/map-gl-style-switcher.css'
import { installMapGrab } from '@mapgrab/map-interface'
import maplibregl, { type StyleSpecification } from 'maplibre-gl'
import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { type ExtendedStyleItem, getStyleSpecification, MapStyles } from '@/utils/mapStyles'

// Shared map context type - used by all map contexts
export interface BaseMapContextType {
  mapContainer: React.RefObject<HTMLDivElement | null>
  map: React.RefObject<maplibregl.Map | null>
  mapLoaded: boolean
  clusteringEnabled: boolean
  setClusteringEnabled: (enabled: boolean) => void
  lastZoom: number
  changeMapStyle: (styleItem: ExtendedStyleItem) => void
  currentStyleId: string
}

export interface MapContextProviderProps {
  mapId: string
  initialCenter?: [number, number]
  initialZoom?: number
  initialStyleId?: string
  children: ReactNode
}

const MapContext = createContext<BaseMapContextType | undefined>(undefined)

export const MapContextProvider = ({
  mapId,
  initialCenter = [0, 0],
  initialZoom = 0,
  initialStyleId = 'osm-us-vector',
  children,
}: MapContextProviderProps) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState<boolean>(false)
  const [clusteringEnabled, setClusteringEnabled] = useState(true)
  const lastZoomRef = useRef(initialZoom)
  const [currentStyleId, setCurrentStyleId] = useState(initialStyleId)
  const isInitialized = useRef(false)

  useEffect(() => {
    if (isInitialized.current || !mapContainer.current) return
    isInitialized.current = true

    const newMap = new maplibregl.Map({
      container: mapContainer.current,
      style: MapStyles.osmUsVector as StyleSpecification,
      center: initialCenter,
      zoom: initialZoom,
    })

    map.current = newMap

    installMapGrab(newMap, mapId)

    newMap.on('load', () => {
      setMapLoaded(true)
    })

    newMap.on('zoom', () => {
      if (!map.current) return
      lastZoomRef.current = map.current.getZoom()
    })

    return () => {
      if (map.current) {
        try {
          map.current.remove()
        } catch (e) {
          console.warn('Error removing map:', e)
        }
        map.current = null
        setMapLoaded(false)
      }
      isInitialized.current = false
    }
  }, [mapId, initialCenter, initialZoom])

  const changeMapStyle = useCallback((styleItem: ExtendedStyleItem) => {
    if (!map.current) return

    const styleSpec = getStyleSpecification(styleItem.styleUrl)
    if (styleSpec) {
      map.current.setStyle(styleSpec as StyleSpecification)
    } else {
      map.current.setStyle(styleItem.styleUrl)
    }

    if (styleItem.maxZoom !== undefined) {
      map.current.setMaxZoom(styleItem.maxZoom)
    }

    if (styleItem.maxZoom !== undefined && map.current.getZoom() > styleItem.maxZoom) {
      map.current.setZoom(styleItem.maxZoom)
    }

    setCurrentStyleId(styleItem.id)
  }, [])

  const value = useMemo<BaseMapContextType>(
    () => ({
      mapContainer,
      map,
      mapLoaded,
      clusteringEnabled,
      setClusteringEnabled,
      lastZoom: lastZoomRef.current,
      changeMapStyle,
      currentStyleId,
    }),
    [
      mapContainer,
      map,
      mapLoaded,
      clusteringEnabled,
      setClusteringEnabled,
      changeMapStyle,
      currentStyleId,
    ]
  )

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>
}

export const useMapContext = () => {
  const context = useContext(MapContext)
  if (context === undefined) {
    throw new Error('useMapContext must be used within a MapContextProvider')
  }
  return context
}
