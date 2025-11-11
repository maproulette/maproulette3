import { SplitViewLayout } from '@/components/shared'
import { ChallengeTaskMarkersProvider } from '@/contexts/exploreChallenges/ChallengeTaskMarkersContext'
import { ExtendedChallengesProvider } from '@/contexts/exploreChallenges/ExtendedChallengesContext'
import { SearchContextProvider } from '@/contexts/exploreChallenges/SearchContext'
import { MapContextProvider } from '@/contexts/MapContext'
import { ChallengePanel } from './ChallengePanel'
import { ChallengeMap } from './ChallengesMap'
import { FilterBar } from './FilterBar'

export const Challenges = () => {
  return (
    <SearchContextProvider>
      <MapContextProvider>
        <ChallengeTaskMarkersProvider>
          <ExtendedChallengesProvider>
            <div className="flex flex-col">
              <FilterBar />
              <SplitViewLayout leftPanel={<ChallengePanel />} rightPanel={<ChallengeMap />} />
            </div>
          </ExtendedChallengesProvider>
        </ChallengeTaskMarkersProvider>
      </MapContextProvider>
    </SearchContextProvider>
  )
}
