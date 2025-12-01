import { createFileRoute } from '@tanstack/react-router'
import { SuperAdminPlugins } from '@/components/SuperAdminPages/SuperAdminPlugins'

export const Route = createFileRoute('/_app/super-admin/plugins')({
  component: SuperAdminPlugins,
})
