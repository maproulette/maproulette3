import { useIntl } from '@/i18n'
import { TeamForm } from './TeamForm'

export const NewTeamPage = () => {
  const { t } = useIntl()
  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <h1 className="mb-4 font-bold text-xl">
        {t('teams.newTeam.title', undefined, 'Create a team')}
      </h1>
      <TeamForm />
    </div>
  )
}
