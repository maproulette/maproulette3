import { ChallengeCard } from '@/components/shared/ChallengeCard'
import { useBrowsedChallengeContext } from '@/contexts/browseChallenge/BrowsedChallengeContext'

export const ChallengesList = () => {
  const { challenge } = useBrowsedChallengeContext()

  return (
    <div className="relative flex-1 overflow-y-auto">
      <div className="space-y-3 p-4">
        <ChallengeCard key={challenge.id} challenge={challenge} />
      </div>
    </div>
  )
}
