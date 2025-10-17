import type { Challenge } from '@/types/Challenge'
import { getDifficultyColor, getDifficultyLabel } from '@/utils/difficultyLevelData'

export const ChallengeCard = ({ challenge }: { challenge: Challenge }) => {
  return (
    <div className="border border-zinc-200 rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer dark:border-zinc-800">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {challenge.featured && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-200">
                POPULAR
              </span>
            )}
          </div>
          <h3 className="font-medium text-sm leading-tight mb-1">{challenge.name}</h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">
            {challenge.parent ? `Project: ${challenge.parent}` : 'Independent Challenge'}
          </p>
        </div>
        <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-1">
          <span className={getDifficultyColor(challenge.difficulty)}>
            {getDifficultyLabel(challenge.difficulty)}
          </span>
        </div>
        <div className="w-full bg-zinc-200 rounded-full h-2 dark:bg-zinc-700">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${challenge.completionPercentage || 0}%` }}
          />
        </div>
        <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
          {challenge.completionPercentage || 0}%
        </div>
      </div>
    </div>
  )
}
