import 'maplibre-gl/dist/maplibre-gl.css'
import maplibregl, { type StyleSpecification } from 'maplibre-gl'
import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
export interface MapContextType {
  mapContainer: React.RefObject<HTMLDivElement | null>
  map: React.RefObject<maplibregl.Map | null>
  mapLoaded: boolean
  clusteringEnabled: boolean
  setClusteringEnabled: (enabled: boolean) => void
  lastZoom: number
}

import MapStyleOsmUsVectorBright from '../styles/osm-bright-osmusa.json'

export const MapStyles = {
  // Vector tiles style from OpenStreetMap US
  osmUsVector: MapStyleOsmUsVectorBright,

  // Default OSM raster tiles
  osmRaster: {
    version: 8,
    name: 'OpenStreetMap',
    glyphs: 'https://tiles.openstreetmap.us/fonts/{fontstack}/{range}.pbf', // OSM US font server
    sources: {
      'osm-raster': {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors',
      },
    },
    layers: [
      {
        id: 'osm-raster-layer',
        type: 'raster',
        source: 'osm-raster',
        minzoom: 0,
        maxzoom: 22,
      },
    ],
  },
}

const MapContext = createContext<MapContextType | undefined>(undefined)

export const MapContextProvider = ({ children }: { children: ReactNode }) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState<boolean>(false)
  const [clusteringEnabled, setClusteringEnabled] = useState(true)
  const [lastZoom, setLastZoom] = useState(1)

  useEffect(() => {
    if (map.current || !mapContainer.current) return

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: MapStyles.osmUsVector as StyleSpecification, // or MapStyles.osmRaster
      center: [-111.891, 40.7608], // salt lake city
      zoom: 12,
    })

    map.current.on('load', () => {
      setMapLoaded(true)
    })

    map.current.on('zoom', () => {
      if (!map.current) return
      setLastZoom(map.current.getZoom())
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
        setMapLoaded(false)
      }
    }
  }, [])

  const value: MapContextType = {
    mapContainer,
    map,
    mapLoaded,
    clusteringEnabled,
    setClusteringEnabled,
    lastZoom,
  }

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>
}

export const useMapContext = () => {
  const context = useContext(MapContext)
  if (context === undefined) {
    throw new Error('useMapContext must be used within an MapContextProvider')
  }
  return context
}
