import { ChevronUp } from 'lucide-react'
import { useChallengeContext } from '@/contexts/tasks/ChallengeContext'

export const TaskInstructionsPanel = () => {
  const { challenge } = useChallengeContext()

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <div className="border-gray-200 border-b px-4 py-3 dark:border-zinc-700">
        <h3 className="flex items-center justify-between font-semibold text-gray-900 text-sm dark:text-gray-100">
          Instructions
          <ChevronUp className="h-4 w-4 text-gray-500" />
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
