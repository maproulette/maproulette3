import { useNavigate, useSearch } from '@tanstack/react-router'
import { ChallengeTaskMarkersProvider } from '@/contexts/exploreChallenges/ChallengeTaskMarkersContext'
import { ExploreChallengesMapContextProvider } from '@/contexts/exploreChallenges/ExploreChallengesMapContext'
import { ExtendedChallengesProvider } from '@/contexts/exploreChallenges/ExtendedChallengesContext'
import { SearchContextProvider } from '@/contexts/exploreChallenges/SearchContext'
import { SplitViewLayout } from '../shared/SplitViewLayout'
import { ChallengePanel } from './ChallengePanel'
import { ChallengeMap } from './ChallengesMap'
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
    <SearchContextProvider>
      <ExploreChallengesMapContextProvider>
        <ChallengeTaskMarkersProvider>
          <ExtendedChallengesProvider>
            <div className="flex flex-col">
              <FilterBar viewMode={viewMode} onViewModeChange={handleViewModeChange} />
              <div className={showMap ? 'block' : 'hidden'}>
                <SplitViewLayout
                  leftPanel={<ChallengePanel viewMode={viewMode} />}
                  rightPanel={<ChallengeMap />}
                />
              </div>
              <div
                className={
                  showMap
                    ? 'hidden'
                    : 'relative h-[calc(100vh-16rem)] min-h-[400px] md:h-[calc(100vh-6rem)] md:min-h-[500px]'
                }
              >
                <ChallengePanel viewMode={viewMode} />
              </div>
            </div>
          </ExtendedChallengesProvider>
        </ChallengeTaskMarkersProvider>
      </ExploreChallengesMapContextProvider>
    </SearchContextProvider>
  )
}
