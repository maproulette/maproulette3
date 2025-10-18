import { MapContextProvider } from '@/contexts/MapContext'
import { ChallengePanel } from './ChallengePanel'
import { ChallengeMap } from './ChallengesMap'
import { SearchContextProvider } from '@/contexts/exploreChallenges/SearchContext'

export const Challenges = () => {
  return (
    <SearchContextProvider>
      <MapContextProvider>
        <div className="flex h-[calc(100vh-7rem)]">
          <ChallengePanel />
          <ChallengeMap />
        </div>
      </MapContextProvider>
    </SearchContextProvider>
  )
}
