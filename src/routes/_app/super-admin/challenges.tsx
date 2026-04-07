import { createFileRoute } from '@tanstack/react-router'
import { SuperAdminChallenges } from '@/components/Pages/SuperAdminPages/SuperAdminChallenges'

export const Route = createFileRoute('/_app/super-admin/challenges')({
  component: SuperAdminChallenges,
})
