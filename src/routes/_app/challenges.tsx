import { createFileRoute } from '@tanstack/react-router'
import { Challenges } from '@/pages/challenges'

export const Route = createFileRoute('/_app/challenges')({
  head: () => ({
    meta: [
      {
        title: 'Challenges',
      },
    ],
  }),
  component: Challenges,
})
