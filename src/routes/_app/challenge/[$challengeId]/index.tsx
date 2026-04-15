import { createFileRoute, notFound } from '@tanstack/react-router'
import { z } from 'zod'
import { api } from '@/api'
import { BrowsedChallengePage } from '@/components/Pages/BrowsedChallengePage'
import { logger } from '@/lib/logger'

const challengeSearchSchema = z.object({
  bounds: z.string().optional(), // format: "minLon,minLat,maxLon,maxLat"
  comments: z.coerce.number().optional(), // 1 → auto-open comments modal
})

export const Route = createFileRoute('/_app/challenge/$challengeId/')({
  validateSearch: challengeSearchSchema,
  staticData: { pageTitle: 'Browse Challenge' },
  loader: async ({ params: { challengeId }, context: { queryClient } }) => {
    const challenge = await queryClient.ensureQueryData(
      api.challenge.getChallengeOptions(Number(challengeId))
    )

    return { challenge }
  },
  head: ({ loaderData }) => {
    const challenge = loaderData?.challenge

    return {
      meta: [
        {
          title: challenge?.name ? `Challenge: ${challenge.name}` : 'Loading challenge',
        },
      ],
    }
  },
  onError(error) {
    logger.error('Error loading challenge route', { error })
    notFound({ throw: true })
  },
  component: BrowsedChallengePage,
})
