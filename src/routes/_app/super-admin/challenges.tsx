import { createFileRoute } from '@tanstack/react-router'
import { SuperAdminChallenges } from '@/components/Pages/SuperAdminPages/SuperAdminChallenges'

export const Route = createFileRoute('/_app/super-admin/challenges')({
  staticData: { pageTitle: 'All Challenges' },
  component: SuperAdminChallenges,
})
