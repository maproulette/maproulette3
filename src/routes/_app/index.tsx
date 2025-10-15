import { HomePage } from '@/pages'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/')({
  head: () => ({
    meta: [
      {
        title: 'Challenges',
      },
    ],
  }),
  component: HomePage,
})

