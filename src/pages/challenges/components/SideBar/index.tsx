import Header from './Header'
import { ExtendedChallengesProvider } from '@/contexts/challenges/ExtendedChallengesContext.tsx'
import { ChallengesList } from './ChallengesList.tsx'

export const SideBar = () => {
  return (
    <ExtendedChallengesProvider>
      <div className="w-120 mr-3 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col">
        <Header />
        <ChallengesList />
      </div>
    </ExtendedChallengesProvider>
  )
}
