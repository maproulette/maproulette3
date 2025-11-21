import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/manage')({
  head: () => ({
    meta: [
      {
        title: 'Manage',
      },
    ],
  }),
})
