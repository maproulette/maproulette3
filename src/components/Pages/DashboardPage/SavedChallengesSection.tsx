import { Link } from '@tanstack/react-router'
import { Bookmark } from 'lucide-react'
import { api } from '@/api'
import { Loader } from '@/components/ui/Loader'
import { useIntl } from '@/i18n'

interface SavedChallengesSectionProps {
  userId: number
}

export const SavedChallengesSection = ({ userId }: SavedChallengesSectionProps) => {
  const { t } = useIntl()
  const { data: challenges, isLoading, error } = api.user.savedChallenges(userId, 10)

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-xl bg-white dark:bg-slate-800">
      <div className="flex shrink-0 items-center gap-2 px-4 py-3">
        <Bookmark className="h-4 w-4 text-blue-400" />
        <h3 className="font-medium text-sm text-zinc-800 dark:text-slate-200">
          {t('dashboard.savedChallenges.title', undefined, 'Saved Challenges')}
        </h3>
        {challenges && challenges.length > 0 && (
          <span className="ml-auto rounded-full bg-blue-500/20 px-2 py-0.5 font-medium text-blue-400 text-xs">
            {challenges.length}
          </span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {isLoading && (
          <div className="flex justify-center py-4">
            <Loader />
          </div>
        )}

        {error && (
          <div className="py-2 text-center text-red-400 text-sm">
            {t('dashboard.common.failedToLoad', undefined, 'Failed to load')}
          </div>
        )}

        {!isLoading && !error && challenges?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="mb-2 rounded-lg bg-zinc-100 p-2 dark:bg-slate-700/50">
              <Bookmark className="h-5 w-5 text-zinc-400 dark:text-slate-500" />
            </div>
            <p className="text-sm text-zinc-600 dark:text-slate-400">
              {t('dashboard.savedChallenges.empty.title', undefined, 'No saved challenges')}
            </p>
            <p className="text-xs text-zinc-500 dark:text-slate-500">
              {t(
                'dashboard.savedChallenges.empty.description',
                undefined,
                'Save challenges to work on later'
              )}
            </p>
          </div>
        )}

        {!isLoading && !error && challenges && challenges.length > 0 && (
          <div className="space-y-2">
            {challenges.map((challenge) => (
              <Link
                key={challenge.id}
                to="/challenge/$challengeId"
                params={{ challengeId: challenge.id.toString() }}
                className="block rounded-lg bg-zinc-100 p-3 transition-colors hover:bg-zinc-200 dark:bg-slate-700/30 dark:hover:bg-slate-700/50"
              >
                <div className="font-medium text-sm text-zinc-800 dark:text-slate-200">
                  {challenge.name}
                </div>
                <div className="mt-1.5 flex items-center gap-3 text-xs">
                  <span className="text-zinc-600 dark:text-slate-400">
                    {t(
                      'dashboard.savedChallenges.remaining',
                      { count: challenge.completionMetrics?.tasksRemaining ?? 0 },
                      '{count} remaining'
                    )}
                  </span>
                  <div className="flex flex-1 items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-300 dark:bg-slate-600">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${challenge.completionPercentage || 0}%` }}
                      />
                    </div>
                    <span className="text-zinc-500 dark:text-slate-500">
                      {challenge.completionPercentage || 0}%
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
