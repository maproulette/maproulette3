import { ChallengeTaskMarkersProvider } from '@/contexts/exploreChallenges/ChallengeTaskMarkersContext'
import { SearchContextProvider } from '@/contexts/exploreChallenges/SearchContext'
import { MapContextProvider } from '@/contexts/MapContext'
import { ChallengePanel } from './ChallengePanel'
import { ChallengeMap } from './ChallengesMap'

export const Challenges = () => {
  return (
    <SearchContextProvider>
      <MapContextProvider>
        <ChallengeTaskMarkersProvider>
          <div className="flex h-[calc(100vh-7rem)]">
            <ChallengePanel />
            <ChallengeMap />
          </div>
        </ChallengeTaskMarkersProvider>
      </MapContextProvider>
    </SearchContextProvider>
  )
}
