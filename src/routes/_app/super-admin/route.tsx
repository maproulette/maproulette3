import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/super-admin')({
  head: () => ({
    meta: [
      {
        title: 'Super Admin',
      },
    ],
  }),
})

