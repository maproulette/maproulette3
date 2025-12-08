import { SplitViewLayout } from '../shared/SplitViewLayout'
import { ChallengeList } from './ChallengeList'
import { ChallengeMap } from './ChallengesMap'
import {
  ExploreChallengesSearchContextProvider,
  useExploreChallengesSearchContext,
} from './ExploreChallengesSearchContext'
import { FilterBar } from './FilterBar'

const ChallengesContent = () => {
  const { viewMode } = useExploreChallengesSearchContext()

  return (
    <div className="flex flex-col">
      <FilterBar />
      {viewMode === 'grid-map' ? (
        <SplitViewLayout
          leftPanel={<ChallengeList viewMode={viewMode} />}
          rightPanel={<ChallengeMap />}
        />
      ) : (
        <div className="relative h-[calc(100vh-16rem)] min-h-[400px] md:h-[calc(100vh-6rem)] md:min-h-[500px]">
          <ChallengeList viewMode={viewMode} />
        </div>
      )}
    </div>
  )
}

export const Challenges = () => {
  return (
    <ExploreChallengesSearchContextProvider>
      <ChallengesContent />
    </ExploreChallengesSearchContextProvider>
  )
}
