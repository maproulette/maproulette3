import { SearchContextProvider } from './SearchContextProvider'
import ChallengeMap from './components/ChallengeMap'
import SideBar from './components/SideBar'

export const Challenges = () => {
  return (
    <SearchContextProvider>
      <div className="flex h-screen">
        <SideBar />
        <ChallengeMap />
      </div>
    </SearchContextProvider>
  )
}
