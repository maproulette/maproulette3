import { useNavigate, useSearch } from '@tanstack/react-router'
import { SplitViewLayout } from '@/components/shared'
import { ChallengeTaskMarkersProvider } from '@/contexts/exploreChallenges/ChallengeTaskMarkersContext'
import { ExtendedChallengesProvider } from '@/contexts/exploreChallenges/ExtendedChallengesContext'
import { SearchContextProvider } from '@/contexts/exploreChallenges/SearchContext'
import { MapContextProvider } from '@/contexts/MapContext'
import { ChallengePanel } from './ChallengePanel'
import { ChallengeMap } from './ChallengesMap'
import { FilterBar, type ViewMode } from './FilterBar'

export const Challenges = () => {
  const navigate = useNavigate()
  const search = useSearch({ from: '/_app/challenges/' })

  const viewMode = (search.viewMode as ViewMode) || 'grid-map'

  const handleViewModeChange = (mode: ViewMode) => {
    navigate({
      to: '/challenges',
      search: (prev) => ({ ...prev, viewMode: mode }),
      replace: true,
    })
  }

  // Determine if map should be shown based on view mode
  const showMap = viewMode === 'grid-map'

  return (
    <SearchContextProvider
      initialDifficulty={search.difficulty}
      initialWorkOn={search.workOn}
      initialCategories={search.categories}
      initialSortBy={search.sortBy}
      initialGlobal={search.global}
      initialLocationId={search.location_id}
      initialBounds={search.bounds}
    >
      <MapContextProvider>
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
                    : 'relative h-[calc(100vh-16rem)] min-h-[400px] md:h-[calc(100vh-11.4rem)] md:min-h-[500px]'
                }
              >
                <ChallengePanel viewMode={viewMode} />
              </div>
            </div>
          </ExtendedChallengesProvider>
        </ChallengeTaskMarkersProvider>
      </MapContextProvider>
    </SearchContextProvider>
  )
}
