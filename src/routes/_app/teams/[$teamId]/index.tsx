import { createFileRoute } from '@tanstack/react-router'
import { TeamDetailPage } from '@/components/Pages/TeamsPage/TeamDetailPage'

const TeamDetail = () => {
  const { teamId } = Route.useParams()
  return <TeamDetailPage teamId={Number(teamId)} />
}

export const Route = createFileRoute('/_app/teams/$teamId/')({
  staticData: { pageTitle: 'Team' },
  head: () => ({ meta: [{ title: 'Team' }] }),
  component: TeamDetail,
})
