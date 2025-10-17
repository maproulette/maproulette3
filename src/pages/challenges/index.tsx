import { SearchContextProvider } from './SearchContextProvider'
import { ChallengeMap } from './components/ChallengeMap'
import { MapContextProvider } from './MapContext'
import { SideBar } from './components/SideBar'

export const Challenges = () => {
  return (
    <SearchContextProvider>
      <MapContextProvider>
        <div className="flex h-[calc(100vh-7rem)]">
          <SideBar />
          <ChallengeMap />
        </div>
      </MapContextProvider>
    </SearchContextProvider>
  )
}
