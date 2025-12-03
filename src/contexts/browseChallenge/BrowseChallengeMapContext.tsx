/**
 * Browse Challenge Map Context - used for the individual challenge browsing page
 */
import { createMapContext } from '@/utils/createMapContext'

export type { BaseMapContextType as BrowseChallengeMapContextType } from '@/utils/createMapContext'

const { Provider, useContext, Context } = createMapContext({
  mapId: 'browseChallengeMap',
  initialCenter: [0, 0],
  initialZoom: 0,
  initialStyleId: 'osm-us-vector',
})

export const BrowseChallengeMapContextProvider = Provider
export const useBrowseChallengeMapContext = useContext
export const BrowseChallengeMapContext = Context
