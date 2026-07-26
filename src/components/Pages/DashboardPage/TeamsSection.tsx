import { Users } from 'lucide-react'
import { api } from '@/api'
import { Loader } from '@/components/ui/Loader'
import { useIntl } from '@/i18n'
import { cn, initials as getInitials } from '@/lib/utils'

interface TeamsSectionProps {
  userId: number
}

type TFunction = ReturnType<typeof useIntl>['t']

const getTeamStatusStyle = (status: number, t: TFunction): { label: string; color: string } => {
  const styles: Record<number, { label: string; color: string }> = {
    0: {
      label: t('common.invited', undefined, 'Invited'),
      color: 'bg-yellow-500/20 text-yellow-400',
    },
    1: {
      label: t('common.member', undefined, 'Member'),
      color: 'bg-emerald-500/20 text-emerald-400',
    },
    2: {
      label: t('common.admin', undefined, 'Admin'),
      color: 'bg-purple-500/20 text-purple-400',
    },
  }
  return (
    styles[status] || {
      label: t('common.unknown', undefined, 'Unknown'),
      color: 'bg-zinc-500/20 text-zinc-400',
    }
  )
}

export const TeamsSection = ({ userId }: TeamsSectionProps) => {
  const { t } = useIntl()
  const { data: teamMemberships, isLoading, error } = api.user.teamMemberships(userId)

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-xl bg-white dark:bg-slate-800">
      <div className="flex shrink-0 items-center gap-2 px-4 py-3">
        <Users className="h-4 w-4 text-purple-400" />
        <h3 className="font-medium text-sm text-zinc-800 dark:text-slate-200">
          {t('common.teams', undefined, 'Teams')}
        </h3>
        {teamMemberships && teamMemberships.length > 0 && (
          <span className="ml-auto rounded-full bg-purple-500/20 px-2 py-0.5 font-medium text-purple-400 text-xs">
            {teamMemberships.length}
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

        {!isLoading && !error && teamMemberships?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="mb-2 rounded-lg bg-zinc-100 p-2 dark:bg-slate-700/50">
              <Users className="h-5 w-5 text-zinc-400 dark:text-slate-500" />
            </div>
            <p className="text-sm text-zinc-600 dark:text-slate-400">
              {t('dashboard.teams.empty.title', undefined, 'No teams')}
            </p>
            <p className="text-xs text-zinc-500 dark:text-slate-500">
              {t('dashboard.teams.empty.description', undefined, 'Join a team to collaborate')}
            </p>
          </div>
        )}

        {!isLoading && !error && teamMemberships && teamMemberships.length > 0 && (
          <div className="space-y-2">
            {teamMemberships.map((membership) => {
              const statusStyle = getTeamStatusStyle(membership.status, t)
              return (
                <div
                  key={membership.id}
                  className="flex items-center justify-between rounded-lg bg-zinc-100 p-3 dark:bg-slate-700/30"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20 font-medium text-purple-400 text-xs">
                      {getInitials(membership.name || `T${membership.teamId}`)}
                    </div>
                    <div className="font-medium text-sm text-zinc-800 dark:text-slate-200">
                      {membership.name ||
                        t('common.team', { teamId: membership.teamId }, 'Team #{teamId}')}
                    </div>
                  </div>
                  <span className={cn('rounded-full px-2 py-0.5 text-xs', statusStyle.color)}>
                    {statusStyle.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
