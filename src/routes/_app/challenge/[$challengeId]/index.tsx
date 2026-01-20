import { createFileRoute, notFound } from '@tanstack/react-router'
import { z } from 'zod'
import { api } from '@/api'
import { BrowsedChallengePage } from '@/components/BrowsedChallengePage'

const challengeSearchSchema = z.object({
  bounds: z.string().optional(), // format: "minLon,minLat,maxLon,maxLat"
})

export const Route = createFileRoute('/_app/challenge/$challengeId/')({
  validateSearch: challengeSearchSchema,
  loader: async ({ context, params: { challengeId } }) => {
    const challenge = await context.queryClient.fetchQuery(
      api.challenge.getChallenge(Number(challengeId))
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
    console.error('Error loading task route', error)
    notFound({ throw: true })
  },
  component: BrowsedChallengePage,
})
