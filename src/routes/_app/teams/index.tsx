import { createFileRoute } from '@tanstack/react-router'
import { TeamsList } from '@/components/Pages/TeamsPage/TeamsList'

export const Route = createFileRoute('/_app/teams/')({
  staticData: { pageTitle: 'Teams' },
  head: () => ({ meta: [{ title: 'Teams' }] }),
  component: TeamsList,
})
