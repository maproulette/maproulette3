import { ExtendedChallengesProvider } from '@/contexts/exploreChallenges/ExtendedChallengesContext'
import { ChallengesList } from './ChallengesList'
import Header from './Header'

export const ChallengePanel = () => {
  return (
    <ExtendedChallengesProvider>
      <div className="flex flex-col w-120 overflow-hidden border-zinc-200 border-r bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <Header />
        <ChallengesList />
      </div>
    </ExtendedChallengesProvider>
  )
}
