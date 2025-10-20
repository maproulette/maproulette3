import { ChevronDown } from 'lucide-react'
import { useChallengeContext } from '@/contexts/tasks/ChallengeContext'

export const ChallengeInfoPanel = () => {
  const { challenge } = useChallengeContext()
  if (!challenge) return null
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <div className="border-gray-200 border-b px-4 py-3 dark:border-zinc-700">
        <h3 className="flex items-center justify-between font-semibold text-gray-900 text-sm dark:text-gray-100">
          Challenge Information
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </h3>
      </div>
      <div className="px-4 py-3">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100">{challenge.name}</h4>
            <p className="text-gray-500 text-xs dark:text-gray-400">ID: {challenge.id}</p>
          </div>
          {challenge.description && (
            <p className="text-gray-600 text-sm dark:text-gray-300">{challenge.description}</p>
          )}
          {challenge.blurb && (
            <p className="text-gray-500 text-xs dark:text-gray-400">{challenge.blurb}</p>
          )}
          <div className="grid grid-cols-3 gap-4 border-gray-100 border-t pt-2 dark:border-zinc-700">
            <div className="text-center">
              <div className="font-semibold text-gray-900 text-lg dark:text-gray-100">
                {challenge.difficulty}
              </div>
              <div className="text-gray-500 text-xs dark:text-gray-400">Difficulty</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900 text-lg dark:text-gray-100">
                {challenge.tasksRemaining}
              </div>
              <div className="text-gray-500 text-xs dark:text-gray-400">Remaining</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900 text-lg dark:text-gray-100">
                {challenge.completionPercentage}%
              </div>
              <div className="text-gray-500 text-xs dark:text-gray-400">Complete</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
