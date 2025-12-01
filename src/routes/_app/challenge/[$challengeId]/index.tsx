import { createFileRoute, notFound } from '@tanstack/react-router'
import { api } from '@/api'
import { BrowsedChallengePage } from '@/components/BrowsedChallengePage'
import type { Challenge } from '@/types/Challenge'

export const Route = createFileRoute('/_app/challenge/$challengeId/')({
  head: ({ loaderData }) => {
    const { challenge }: { challenge: Challenge } = loaderData ?? {
      challenge: undefined as unknown as Challenge,
    }

    return {
      meta: [
        {
          title: challenge?.name ? `Task: ${challenge.name}` : 'Loading task',
        },
      ],
    }
  },
  loader: async ({ context, params: { challengeId } }) => {
    const challenge = await context.queryClient.ensureQueryData(
      api.challenge.getChallenge(Number(challengeId))
    )

    return { challenge }
  },
  onError(error) {
    console.error('Error loading task route', error)
    notFound({ throw: true })
  },
  component: BrowsedChallengePage,
})
