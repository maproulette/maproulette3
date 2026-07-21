import { Link } from '@tanstack/react-router'
import { Plus, Users } from 'lucide-react'
import { api } from '@/api'
import { Button } from '@/components/ui/Button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/Empty'
import { Loader } from '@/components/ui/Loader'
import { useAuthContext } from '@/contexts/AuthContext'
import { useIntl } from '@/i18n'
import { PendingInvitesSection } from './PendingInvitesSection'
import { TeamCard } from './TeamCard'

export const TeamsList = () => {
  const { t } = useIntl()
  const { user } = useAuthContext()
  const { data: memberships = [], isLoading } = api.user.teamMemberships(user?.id)

  const pending = memberships.filter((m) => m.status === 0)
  const active = memberships.filter((m) => m.status !== 0)

  if (isLoading) return <Loader />

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-xl">{t('common.teams', undefined, 'Teams')}</h1>
        <Button asChild>
          <Link to="/teams/new">
            <Plus className="size-4" aria-hidden="true" />{' '}
            {t('common.createTeam', undefined, 'Create team')}
          </Link>
        </Button>
      </div>

      {pending.length > 0 && <PendingInvitesSection invites={pending} />}

      {active.length === 0 && pending.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
            <EmptyTitle>{t('teams.list.emptyTitle', undefined, 'No teams yet')}</EmptyTitle>
            <EmptyDescription>
              {t(
                'teams.list.emptyDescription',
                undefined,
                'Create a team to collaborate with others on challenges.'
              )}
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link to="/teams/new">{t('common.createTeam', undefined, 'Create team')}</Link>
          </Button>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {active.map((m) => (
            <TeamCard key={m.id} membership={m} />
          ))}
        </div>
      )}
    </div>
  )
}
