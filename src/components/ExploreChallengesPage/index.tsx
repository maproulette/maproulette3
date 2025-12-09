import { ExploreChallengesResults } from './ExploreChallengesResults'
import { ExploreChallengesSearchContextProvider } from './ExploreChallengesSearchContext'
import { FilterBar } from './FilterBar'

export const Challenges = () => {
  return (
    <ExploreChallengesSearchContextProvider>
      <div className="flex flex-col">
        <FilterBar />
        <ExploreChallengesResults />
      </div>
    </ExploreChallengesSearchContextProvider>
  )
}
