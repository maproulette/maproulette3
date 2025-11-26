import { useState } from 'react'
import { SplitViewLayout } from '@/components/shared'
import { ChallengeTaskMarkersProvider } from '@/contexts/exploreChallenges/ChallengeTaskMarkersContext'
import { ExtendedChallengesProvider } from '@/contexts/exploreChallenges/ExtendedChallengesContext'
import { SearchContextProvider } from '@/contexts/exploreChallenges/SearchContext'
import { MapContextProvider } from '@/contexts/MapContext'
import { ChallengePanel } from './ChallengePanel'
import { ChallengeMap } from './ChallengesMap'
import { FilterBar, type ViewMode } from './FilterBar'

export const Challenges = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid-map')

  // Determine if map should be shown based on view mode
  const showMap = viewMode === 'grid-map'

  return (
    <SearchContextProvider>
      <MapContextProvider>
        <ChallengeTaskMarkersProvider>
          <ExtendedChallengesProvider>
            <div className="flex flex-col">
              <FilterBar viewMode={viewMode} onViewModeChange={setViewMode} />
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
