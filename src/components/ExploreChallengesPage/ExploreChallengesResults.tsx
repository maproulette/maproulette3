import { SplitViewLayout } from '../shared/SplitViewLayout'
import { ChallengeList } from './ChallengeList'
import { ExploreChallengesMap } from './ExploreChallengesMap'
import { ChallengeTaskMarkersProvider } from './ExploreChallengesMap/ChallengeTaskMarkersContext'
import { ExploreChallengesMapContextProvider } from './ExploreChallengesMap/ExploreChallengesMapContext'
import { useExploreChallengesSearchContext } from './ExploreChallengesSearchContext'

export const ExploreChallengesResults = () => {
  const { viewMode } = useExploreChallengesSearchContext()
  if (viewMode === 'grid-map') {
    return (
      <SplitViewLayout
        leftPanel={<ChallengeList viewMode={viewMode} />}
        rightPanel={
          <ExploreChallengesMapContextProvider>
            <ChallengeTaskMarkersProvider>
              <ExploreChallengesMap />
            </ChallengeTaskMarkersProvider>
          </ExploreChallengesMapContextProvider>
        }
      />
    )
  }
  return (
    <div className="relative h-[calc(100vh-16rem)] min-h-[400px] md:h-[calc(100vh-6rem)] md:min-h-[500px]">
      <ChallengeList viewMode={viewMode} />
    </div>
  )
}
