import { createFileRoute } from '@tanstack/react-router'
import { SuperAdminAnalytics } from '@/components/SuperAdminPages/SuperAdminAnalytics'

export const Route = createFileRoute('/_app/super-admin/analytics')({
  component: SuperAdminAnalytics,
})
