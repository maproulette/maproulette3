import { ExtendedChallengesProvider } from '@/contexts/challenges/ExtendedChallengesContext'
import { ChallengesList } from './ChallengesList'
import Header from './Header'

export const ChallengePanel = () => {
  return (
    <ExtendedChallengesProvider>
      <div className="mr-3 flex w-120 flex-col border-zinc-200 border-r bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <Header />
        <ChallengesList />
      </div>
    </ExtendedChallengesProvider>
  )
}
