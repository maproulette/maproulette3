import { useChallengeContext } from '@/contexts/tasks/ChallengeContext'

export const ChallengeInfoPanel = () => {
  const { challenge } = useChallengeContext()
  if (!challenge) return null
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-zinc-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-between">
          Challenge Information
          <svg
            className="w-4 h-4 text-gray-500"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </h3>
      </div>
      <div className="px-4 py-3">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100">{challenge.name}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">ID: {challenge.id}</p>
          </div>
          {challenge.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300">{challenge.description}</p>
          )}
          {challenge.blurb && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{challenge.blurb}</p>
          )}
          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-100 dark:border-zinc-700">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {challenge.difficulty}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Difficulty</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {challenge.tasksRemaining}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {challenge.completionPercentage}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Complete</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
