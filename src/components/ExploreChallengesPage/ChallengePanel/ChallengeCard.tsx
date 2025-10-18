import type { Challenge } from '@/types/Challenge'
import { getDifficultyColor, getDifficultyLabel } from '@/utils/difficultyLevelData'

export const ChallengeCard = ({ challenge }: { challenge: Challenge }) => {
  return (
    <div className="cursor-pointer rounded-lg border border-zinc-200 p-4 transition-shadow hover:shadow-sm dark:border-zinc-800">
      <div className="mb-2 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            {challenge.featured && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-800 text-xs dark:bg-blue-900 dark:text-blue-200">
                POPULAR
              </span>
            )}
          </div>
          <h3 className="mb-1 font-medium text-sm leading-tight">{challenge.name}</h3>
          <p className="mb-2 text-xs text-zinc-600 dark:text-zinc-400">
            {challenge.parent ? `Project: ${challenge.parent}` : 'Independent Challenge'}
          </p>
        </div>
        <button
          type="button"
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            role="img"
            aria-label="More options"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 12h.01M12 12h.01M19 12h.01"
            />
          </svg>
        </button>
      </div>

      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
          <span className={getDifficultyColor(challenge.difficulty)}>
            {getDifficultyLabel(challenge.difficulty)}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
          <div
            className="h-2 rounded-full bg-blue-500 transition-all duration-300"
            style={{ width: `${challenge.completionPercentage || 0}%` }}
          />
        </div>
        <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          {challenge.completionPercentage || 0}%
        </div>
      </div>
    </div>
  )
}
