import { DrawerPortalProvider } from '@/components/shared/TaskInfoPanel/DrawerPortalContext'
import { ChallengeResultsContextProvider } from './ChallengeResultsContext'
import { ExploreChallengesResults } from './ExploreChallengesResults'
import { ExploreChallengesSearchContextProvider } from './ExploreChallengesSearchContext'
import { FilterBar } from './FilterBar'

export const Challenges = () => {
  return (
    <ExploreChallengesSearchContextProvider>
      <ChallengeResultsContextProvider>
        <DrawerPortalProvider>
          <div className="flex flex-col gap-4 px-4">
            <FilterBar />
            <ExploreChallengesResults />
          </div>
        </DrawerPortalProvider>
      </ChallengeResultsContextProvider>
    </ExploreChallengesSearchContextProvider>
  )
}
