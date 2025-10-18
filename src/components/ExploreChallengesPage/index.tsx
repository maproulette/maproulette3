import { SearchContextProvider } from '@/contexts/challenges/SearchContext'
import { ChallengeMap } from './ChallengesMap'
import { MapContextProvider } from '@/contexts/challenges/MapContext'
import { ChallengePanel } from './ChallengePanel'

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
