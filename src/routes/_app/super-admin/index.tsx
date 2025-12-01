import { createFileRoute } from '@tanstack/react-router'
import { SuperAdminHome } from '@/components/SuperAdminPages/SuperAdminHome'

export const Route = createFileRoute('/_app/super-admin/')({
  component: SuperAdminHome,
})
