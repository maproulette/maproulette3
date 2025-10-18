import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/components/DashboardPage'

export const Route = createFileRoute('/_app/')({
  head: () => ({
    meta: [
      {
        title: 'Dashboard',
      },
    ],
  }),
  component: Dashboard,
})
