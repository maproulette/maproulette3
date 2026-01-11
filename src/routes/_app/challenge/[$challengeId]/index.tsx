import { createFileRoute, notFound } from '@tanstack/react-router'
import { api } from '@/api'
import { BrowsedChallengePage } from '@/components/BrowsedChallengePage'

export const Route = createFileRoute('/_app/challenge/$challengeId/')({
  loader: async ({ context, params: { challengeId } }) => {
    const challenge = await context.queryClient.ensureQueryData(
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
