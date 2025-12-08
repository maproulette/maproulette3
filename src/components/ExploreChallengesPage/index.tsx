import { useNavigate, useSearch } from '@tanstack/react-router'
import { SplitViewLayout } from '../shared/SplitViewLayout'
import { ChallengeList } from './ChallengeList'
import { ChallengeMap } from './ChallengesMap'
import { ExploreChallengesSearchContextProvider } from './ExploreChallengesSearchContext'
import { FilterBar } from './FilterBar'
import type { ViewMode } from './FilterBar/filterTypes'

export const Challenges = () => {
  const navigate = useNavigate()
  const search = useSearch({ from: '/_app/' })

  const viewMode = (search.viewMode as ViewMode) || 'grid-map'

  const handleViewModeChange = (mode: ViewMode) => {
    navigate({
      to: '/',
      search: (prev) => ({ ...prev, viewMode: mode }),
      replace: true,
    })
  }

  const showMap = viewMode === 'grid-map'

  return (
    <ExploreChallengesSearchContextProvider>
      <div className="flex flex-col">
        <FilterBar viewMode={viewMode} onViewModeChange={handleViewModeChange} />
        {showMap ? (
          <SplitViewLayout
            leftPanel={<ChallengeList viewMode={viewMode} />}
            rightPanel={<ChallengeMap showMap={showMap} />}
          />
        ) : (
          <div className="relative h-[calc(100vh-16rem)] min-h-[400px] md:h-[calc(100vh-6rem)] md:min-h-[500px]">
            <ChallengeList viewMode={viewMode} />
          </div>
        )}
      </div>
    </ExploreChallengesSearchContextProvider>
  )
}
