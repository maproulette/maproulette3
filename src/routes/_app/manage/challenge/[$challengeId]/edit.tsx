import { createFileRoute } from '@tanstack/react-router'
import { ManageChallengeEdit } from '@/components/ManagementPages/ManageChallengeEdit'

export const Route = createFileRoute('/_app/manage/challenge/$challengeId/edit')({
  component: ManageChallengeEdit,
})
