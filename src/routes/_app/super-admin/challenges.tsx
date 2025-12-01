import { createFileRoute } from '@tanstack/react-router'
import { SuperAdminChallenges } from '@/components/SuperAdminPages/SuperAdminChallenges'

export const Route = createFileRoute('/_app/super-admin/challenges')({
  component: SuperAdminChallenges,
})
