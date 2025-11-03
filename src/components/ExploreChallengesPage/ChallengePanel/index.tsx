import { ChallengesList } from './ChallengesList'

export const ChallengePanel = () => {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white md:w-120 md:rounded-bl-lg md:border-zinc-200 md:border-r dark:border-zinc-800 dark:bg-zinc-950">
      <ChallengesList />
    </div>
  )
}
