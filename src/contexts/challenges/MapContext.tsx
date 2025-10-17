import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { createMap } from '../../pages/challenges/components/ChallengeMap/createMap'

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

    map.current = createMap(mapContainer.current, [0, 0], 1)

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

export const useMapContext = (): MapContextType => {
  const context = useContext(MapContext)
  if (context === undefined) {
    throw new Error('useMapContext must be used within an MapContextProvider')
  }
  return context
}
