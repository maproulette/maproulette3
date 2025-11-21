import { createFileRoute } from '@tanstack/react-router'
import { ManageChallenges } from '@/components/ManagementPages/ManageChallenges'

export const Route = createFileRoute('/_app/manage/challenges')({
  component: ManageChallenges,
})
