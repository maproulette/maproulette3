import { DashboardLayout } from '@/pages/dashboard/layout'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/dashboard')({
  head: () => ({
    meta: [
      {
        title: 'Welcome',
      },
    ],
  }),
  component: DashboardLayout,
})
