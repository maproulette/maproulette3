/**
 * Explore Challenges Map Context - used for the main explore/home page
 */
import type { ReactNode } from 'react'
import { MapContextProvider, useMapContext } from '@/contexts/MapContext'

export const ExploreChallengesMapContextProvider = ({ children }: { children: ReactNode }) => {
  return (
    <MapContextProvider
      mapId="exploreChallengesMap"
      initialCenter={[0, 0]}
      initialZoom={0}
      initialStyleId="osm-us-vector"
    >
      {children}
    </MapContextProvider>
  )
}

export const useExploreChallengesMapContext = useMapContext
