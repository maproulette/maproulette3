import { Loader } from '@/components/ui/Loader'
import { useExtendedChallengesContext } from '@/contexts/challenges/ExtendedChallengesContext'
import { ChallengeCard } from './ChallengeCard'

export const ChallengesList = () => {
  const { challenges, challengesLoading } = useExtendedChallengesContext()

  return (
    <div className="relative flex-1 overflow-y-auto">
      <div
        className={`absolute inset-0 flex items-center justify-center bg-white/5 backdrop-blur-sm transition-opacity duration-200 ${
          challengesLoading ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <Loader message="Loading challenges..." />
      </div>
      {!challenges || challenges.length === 0 ? (
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
