import 'maplibre-gl/dist/maplibre-gl.css'
import maplibregl from 'maplibre-gl'
import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
export interface MapContextType {
  mapContainer: React.RefObject<HTMLDivElement | null>
  map: React.RefObject<maplibregl.Map | null>
  mapLoaded: boolean
}

const MapContext = createContext<MapContextType | undefined>(undefined)

export const MapContextProvider = ({ children }: { children: ReactNode }) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState<boolean>(false)

  useEffect(() => {
    if (map.current || !mapContainer.current) return

    //   map.current = new maplibregl.Map({
    //     container: mapContainer.current,
    //     style: {
    //       version: 8,
    //       sources: {
    //         'osm-tiles': {
    //           type: 'raster',
    //           tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
    //           tileSize: 256,
    //           attribution: '© OpenStreetMap contributors',
    //         },
    //       },
    //       layers: [
    //         {
    //           id: 'osm-tiles',
    //           type: 'raster',
    //           source: 'osm-tiles',
    //         },
    //       ],
    //     },
    //     center: [0, 0],
    //     zoom: 1,

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm-tiles',
          },
        ],
      },
      center: [0, 0],
      zoom: 1,
    })

    map.current.on('load', () => {
      setMapLoaded(true)
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
