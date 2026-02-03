import { DrawerPortalProvider } from '@/components/shared/DrawerPortalContext'
import { ExploreChallengesResults } from './ExploreChallengesResults'
import { ExploreChallengesSearchContextProvider } from './ExploreChallengesSearchContext'
import { FilterBar } from './FilterBar'

export const Challenges = () => {
  return (
    <ExploreChallengesSearchContextProvider>
      <DrawerPortalProvider>
        <div className="flex flex-col">
          <FilterBar />
          <ExploreChallengesResults />
        </div>
      </DrawerPortalProvider>
    </ExploreChallengesSearchContextProvider>
  )
}
