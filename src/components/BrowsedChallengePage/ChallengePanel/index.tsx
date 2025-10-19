import { BrowsedChallengeProvider } from '@/contexts/browseChallenge/BrowsedChallengeContext'
import { ChallengesList } from './ChallengesList'

export const ChallengePanel = () => {
  return (
    <BrowsedChallengeProvider>
      <div className="mr-3 flex w-120 flex-col border-zinc-200 border-r bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <ChallengesList />
      </div>
    </BrowsedChallengeProvider>
  )
}
