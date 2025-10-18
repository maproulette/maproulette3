import { useChallengeContext } from '@/contexts/tasks/ChallengeContext'

export const TaskInstructionsPanel = () => {
  const { challenge } = useChallengeContext()

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-zinc-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-between">
          Instructions
          <svg
            className="w-4 h-4 text-gray-500"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
        </h3>
      </div>
      <div className="px-4 py-3">
        {challenge?.instruction && (
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
            <p>{challenge?.instruction}</p>
          </div>
        )}
      </div>
    </div>
  )
}
