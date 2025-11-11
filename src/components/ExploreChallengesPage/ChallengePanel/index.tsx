import { ChallengeCard } from '@/components/shared'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/Empty'
import { Loader } from '@/components/ui/Loader'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { useExtendedChallengesContext } from '@/contexts/exploreChallenges/ExtendedChallengesContext'

export const ChallengePanel = () => {
  const { challenges, challengesLoading } = useExtendedChallengesContext()
  return (
    <div className="relative flex h-full w-full flex-1 flex-col overflow-hidden overflow-hidden bg-white md:w-120 md:rounded-bl-lg md:border-zinc-200 md:border-r dark:border-zinc-800 dark:bg-zinc-950">
      <div
        className={`absolute inset-0 z-10 flex items-center justify-center bg-white/5 backdrop-blur-sm transition-opacity duration-200 ${
          challengesLoading ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <Loader message="Loading challenges..." />
      </div>
      <ScrollArea className="h-full w-full">
        {!challenges || challenges.length === 0 ? (
          <Empty className="p-4">
            <EmptyHeader>
              <EmptyTitle>No challenges found</EmptyTitle>
              <EmptyDescription>Try adjusting your search filters or map bounds.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="w-full space-y-3 p-4">
            {challenges.map((c) => (
              <ChallengeCard key={c.id} challenge={c} />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
