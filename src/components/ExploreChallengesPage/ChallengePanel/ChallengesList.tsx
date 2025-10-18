import { useExtendedChallengesContext } from '@/contexts/challenges/ExtendedChallengesContext'
import { ChallengeCard } from './ChallengeCard'

export const ChallengesList = () => {
  const { challenges, challengesLoading } = useExtendedChallengesContext()

  return (
    <div className="flex-1 overflow-y-auto">
      {challengesLoading ? (
        <div className="p-4 text-center text-zinc-500">Loading challenges...</div>
      ) : !challenges || challenges.length === 0 ? (
        <div className="p-4 text-center text-zinc-500">No challenges found</div>
      ) : (
        <div className="space-y-3 p-4">
          {challenges.map((c) => (
            <ChallengeCard key={c.id} challenge={c} />
          ))}
        </div>
      )}
    </div>
  )
}
