import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { ManageChallengeNew } from '@/components/Pages/ManagementPages/ManageChallengeNew'

const challengeSearchSchema = z.object({
  projectId: z.number().optional(),
})

export const Route = createFileRoute('/_app/manage/challenge/new')({
  staticData: { pageTitle: 'Create Challenge' },
  component: () => {
    const { projectId } = Route.useSearch()
    return <ManageChallengeNew projectId={projectId} />
  },
  validateSearch: challengeSearchSchema,
})
