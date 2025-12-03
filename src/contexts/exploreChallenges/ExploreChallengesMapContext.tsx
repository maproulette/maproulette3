/**
 * Explore Challenges Map Context - used for the main explore/home page
 */
import { createMapContext } from '@/utils/createMapContext'

export type { BaseMapContextType as ExploreChallengesMapContextType } from '@/utils/createMapContext'

const { Provider, useContext, Context } = createMapContext({
  mapId: 'exploreChallengesMap',
  initialCenter: [0, 0],
  initialZoom: 0,
  initialStyleId: 'osm-us-vector',
})

export const ExploreChallengesMapContextProvider = Provider
export const useExploreChallengesMapContext = useContext
export const ExploreChallengesMapContext = Context
