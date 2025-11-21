import { createFileRoute } from '@tanstack/react-router'
import { ManageChallengeDetail } from '@/components/ManagementPages/ManageChallengeDetail'

export const Route = createFileRoute('/_app/manage/challenge/$challengeId/')({
  component: ManageChallengeDetail,
})
