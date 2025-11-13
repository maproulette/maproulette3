import { useState } from 'react'
import { SplitViewLayout } from '@/components/shared'
import { ChallengeTaskMarkersProvider } from '@/contexts/exploreChallenges/ChallengeTaskMarkersContext'
import { ExtendedChallengesProvider } from '@/contexts/exploreChallenges/ExtendedChallengesContext'
import { SearchContextProvider } from '@/contexts/exploreChallenges/SearchContext'
import { MapContextProvider } from '@/contexts/MapContext'
import { ChallengePanel } from './ChallengePanel'
import { ChallengeMap } from './ChallengesMap'
import { FilterBar } from './FilterBar'

export const Challenges = () => {
  const [showMap, setShowMap] = useState(false)
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')

  return (
    <SearchContextProvider>
      <MapContextProvider>
        <ChallengeTaskMarkersProvider>
          <ExtendedChallengesProvider>
            <div className="flex flex-col">
              <FilterBar
                showMap={showMap}
                onToggleMap={setShowMap}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
              <div className={showMap ? 'block' : 'hidden'}>
                <SplitViewLayout
                  leftPanel={<ChallengePanel viewMode={viewMode} showMap={showMap} />}
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
                <ChallengePanel viewMode={viewMode} showMap={showMap} />
              </div>
            </div>
          </ExtendedChallengesProvider>
        </ChallengeTaskMarkersProvider>
      </MapContextProvider>
    </SearchContextProvider>
  )
}
