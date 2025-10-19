import { BrowsedChallengeSearchContextProvider } from '@/contexts/browseChallenge/BrowsedChallegeSearchContext'
import { BrowsedChallengeProvider } from '@/contexts/browseChallenge/BrowsedChallengeContext'
import { MapContextProvider } from '@/contexts/MapContext'
import { ChallengePanel } from './ChallengePanel'
import { ChallengeMap } from './ChallengesMap'

export const BrowsedChallengePage = () => {
  return (
    <BrowsedChallengeSearchContextProvider>
      <BrowsedChallengeProvider>
        <MapContextProvider>
          <div className="flex h-[calc(100vh-7rem)]">
            <ChallengePanel />
            <ChallengeMap />
          </div>
        </MapContextProvider>
      </BrowsedChallengeProvider>
    </BrowsedChallengeSearchContextProvider>
  )
}
