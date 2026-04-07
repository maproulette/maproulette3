import { createFileRoute } from '@tanstack/react-router'
import { SuperAdminPlugins } from '@/components/Pages/SuperAdminPages/SuperAdminPlugins'

export const Route = createFileRoute('/_app/super-admin/plugins')({
  component: SuperAdminPlugins,
})
