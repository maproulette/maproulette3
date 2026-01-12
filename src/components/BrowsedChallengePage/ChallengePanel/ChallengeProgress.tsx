import { Progress } from '@/components/ui/Progress'

interface ChallengeProgressProps {
  completionPercentage?: number
}

export const ChallengeProgress = ({ completionPercentage }: ChallengeProgressProps) => {
  if (completionPercentage === undefined) return null

  return (
    <div className="mb-6 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">Progress</span>
        </div>
        <span className="font-bold text-lg text-zinc-900 dark:text-zinc-50">
          {completionPercentage}%
        </span>
      </div>
      <Progress value={completionPercentage} className="h-2 bg-zinc-200/30 dark:bg-zinc-700/30" />
    </div>
  )
}
