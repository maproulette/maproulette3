import type { ReactNode } from 'react'
import { MapContextProvider, useMapContext } from '@/contexts/MapContext'

export const BrowseChallengeMapContextProvider = ({ children }: { children: ReactNode }) => {
  return (
    <MapContextProvider
      mapId="browseChallengeMap"
      initialCenter={[0, 0]}
      initialZoom={0}
      initialStyleId="osm-us-vector"
    >
      {children}
    </MapContextProvider>
  )
}

export const useBrowseChallengeMapContext = useMapContext
