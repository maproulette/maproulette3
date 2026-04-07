import { createFileRoute } from '@tanstack/react-router'
import { SuperAdminAnalytics } from '@/components/Pages/SuperAdminPages/SuperAdminAnalytics'

export const Route = createFileRoute('/_app/super-admin/analytics')({
  staticData: { pageTitle: 'Analytics' },
  component: SuperAdminAnalytics,
})
