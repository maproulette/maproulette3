import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/pages/dashboard'

export const Route = createFileRoute('/_app/dashboard')({
  head: () => ({
    meta: [
      {
        title: 'Dashboard',
      },
    ],
  }),
  component: Dashboard,
})
