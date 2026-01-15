/**
 * Explore Challenges Map Context - used for the main explore/home page
 */
import type { ReactNode } from 'react'
import { MapContextProvider, useMapContext } from '@/contexts/MapContext'

// Constants to prevent array recreation on every render
const INITIAL_CENTER: [number, number] = [0, 0]
const INITIAL_ZOOM = 0
const INITIAL_STYLE_ID = 'osm-us-vector'

export const ExploreChallengesMapContextProvider = ({ children }: { children: ReactNode }) => {
  return (
    <MapContextProvider
      mapId="exploreChallengesMap"
      initialCenter={INITIAL_CENTER}
      initialZoom={INITIAL_ZOOM}
      initialStyleId={INITIAL_STYLE_ID}
    >
      {children}
    </MapContextProvider>
  )
}

export const useExploreChallengesMapContext = useMapContext
