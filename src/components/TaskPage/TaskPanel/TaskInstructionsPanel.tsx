import { useChallengeContext } from '@/contexts/tasks/ChallengeContext'

export const TaskInstructionsPanel = () => {
  const { challenge } = useChallengeContext()

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <div className="border-gray-200 border-b px-4 py-3 dark:border-zinc-700">
        <h3 className="flex items-center justify-between font-semibold text-gray-900 text-sm dark:text-gray-100">
          Instructions
          <svg
            className="h-4 w-4 text-gray-500"
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
          <div className="space-y-2 text-gray-700 text-sm dark:text-gray-300">
            <p>{challenge?.instruction}</p>
          </div>
        )}
      </div>
    </div>
  )
}
