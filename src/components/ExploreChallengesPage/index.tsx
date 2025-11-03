import { List, Map as MapIcon } from 'lucide-react'
import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { ChallengeTaskMarkersProvider } from '@/contexts/exploreChallenges/ChallengeTaskMarkersContext'
import { ExtendedChallengesProvider } from '@/contexts/exploreChallenges/ExtendedChallengesContext'
import { SearchContextProvider } from '@/contexts/exploreChallenges/SearchContext'
import { MapContextProvider } from '@/contexts/MapContext'
import { ChallengePanel } from './ChallengePanel'
import { ChallengeMap } from './ChallengesMap'
import { FilterBar } from './FilterBar'

export const Challenges = () => {
  const [activeTab, setActiveTab] = useState('list')

  return (
    <SearchContextProvider>
      <MapContextProvider>
        <ChallengeTaskMarkersProvider>
          <ExtendedChallengesProvider>
            <div className="flex flex-col">
              <FilterBar />

              <div className="md:hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col">
                  <div className="border-zinc-200 border-b bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-950">
                    <TabsList className="w-full">
                      <TabsTrigger value="list" className="flex-1">
                        <List  />
                        <span>List</span>
                      </TabsTrigger>
                      <TabsTrigger value="map" className="flex-1">
                        <MapIcon />
                        <span>Map</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </Tabs>
              </div>

              <div className="relative h-[calc(100vh-16rem)] min-h-[400px] md:flex md:h-[calc(100vh-11.4rem)] md:min-h-[500px]">
                <div
                  className={`h-full md:block ${activeTab === 'list' ? 'relative z-10' : 'invisible absolute inset-0'} md:visible md:relative md:z-auto`}
                >
                  <ChallengePanel />
                </div>

                <div
                  className={`h-full md:block md:flex-1 ${activeTab === 'map' ? 'relative z-10' : 'invisible absolute inset-0'} md:visible md:relative md:z-auto`}
                >
                  <ChallengeMap />
                </div>
              </div>
            </div>
          </ExtendedChallengesProvider>
        </ChallengeTaskMarkersProvider>
      </MapContextProvider>
    </SearchContextProvider>
  )
}
