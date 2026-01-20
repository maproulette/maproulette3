import { SplitViewLayout } from '../shared/SplitViewLayout'
import { ChallengeList } from './ChallengeList'
import { ExploreChallengesMap } from './ExploreChallengesMap'
import { useExploreChallengesSearchContext } from './ExploreChallengesSearchContext'

export const ExploreChallengesResults = () => {
  const { viewMode } = useExploreChallengesSearchContext()
  if (viewMode === 'grid-map') {
    return (
      <SplitViewLayout
        leftPanel={<ChallengeList viewMode={viewMode} />}
        rightPanel={<ExploreChallengesMap />}
      />
    )
  }
  return (
    <div className="relative h-[calc(100vh-16rem)] min-h-[400px] md:h-[calc(100vh-11rem)] md:min-h-[500px]">
      <ChallengeList viewMode={viewMode} />
    </div>
  )
}
