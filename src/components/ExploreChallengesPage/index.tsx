import { List, Map } from 'lucide-react'
import { useState } from 'react'
import { ChallengeTaskMarkersProvider } from '@/contexts/exploreChallenges/ChallengeTaskMarkersContext'
import { ExtendedChallengesProvider } from '@/contexts/exploreChallenges/ExtendedChallengesContext'
import { SearchContextProvider } from '@/contexts/exploreChallenges/SearchContext'
import { MapContextProvider } from '@/contexts/MapContext'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'
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
                
                {/* Mobile: Tabs */}
                <div className="md:hidden">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col">
                    <div className="border-zinc-200 border-b bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-950">
                      <TabsList className="w-full">
                        <TabsTrigger value="list" className="flex-1">
                          <List className="size-4" />
                          <span>List</span>
                        </TabsTrigger>
                        <TabsTrigger value="map" className="flex-1">
                          <Map className="size-4" />
                          <span>Map</span>
                        </TabsTrigger>
                      </TabsList>
                    </div>
                  </Tabs>
                </div>

                {/* Content area */}
                <div className="relative h-[calc(100vh-14rem)] min-h-[400px] md:h-[calc(100vh-11.4rem)] md:min-h-[500px] md:flex">
                  {/* List View */}
                  <div className={`h-full md:block ${activeTab === 'list' ? 'relative z-10' : 'absolute inset-0 invisible'} md:visible md:relative md:z-auto`}>
                    <ChallengePanel />
                  </div>
                  {/* Map View */}
                  <div className={`h-full md:block md:flex-1 ${activeTab === 'map' ? 'relative z-10' : 'absolute inset-0 invisible'} md:visible md:relative md:z-auto`}>
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
