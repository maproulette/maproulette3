import { BrowsedChallengeProvider } from '@/contexts/browseChallenge/BrowsedChallengeContext'
import { ChallengeDetail } from './ChallengeDetail'

export const ChallengePanel = () => {
  return (
    <BrowsedChallengeProvider>
      <div className="flex w-full flex-col overflow-hidden border border-zinc-200 bg-white md:h-full md:rounded-2xl md:rounded-r-none md:rounded-l-2xl dark:border-zinc-800 dark:bg-zinc-950">
        <ChallengeDetail />
      </div>
    </BrowsedChallengeProvider>
  )
}
