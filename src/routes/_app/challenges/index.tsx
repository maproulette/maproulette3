import { createFileRoute } from '@tanstack/react-router'
import { Challenges } from '@/components/ExploreChallengesPage'

export const Route = createFileRoute('/_app/challenges/')({
  head: () => ({
    meta: [
      {
        title: 'Challenges',
      },
    ],
  }),
  component: Challenges,
})
