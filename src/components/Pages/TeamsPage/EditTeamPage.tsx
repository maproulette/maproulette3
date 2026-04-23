import { api } from '@/api'
import { Loader } from '@/components/ui/Loader'
import { TeamForm } from './TeamForm'

interface Props {
  teamId: number
}

export const EditTeamPage = ({ teamId }: Props) => {
  const { data: team, isLoading } = api.team.get(teamId)

  if (isLoading) return <Loader />
  if (!team) return <div className="py-12 text-center text-zinc-500">Team not found.</div>

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <h1 className="mb-4 font-bold text-xl">Edit team</h1>
      <TeamForm team={team} />
    </div>
  )
}
