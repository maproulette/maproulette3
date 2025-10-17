import { SearchContextProvider } from './SearchContextProvider'
import { ChallengeMap } from './components/ChallengeMap'
import { MapContextProvider } from './MapContext'
import SideBar from './components/SideBar'

export const Challenges = () => {
  return (
    <SearchContextProvider>
      <MapContextProvider>
        <div className="flex h-screen">
          <SideBar />
          <ChallengeMap />
        </div>
      </MapContextProvider>
    </SearchContextProvider>
  )
}
