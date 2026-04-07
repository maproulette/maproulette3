import { createFileRoute } from '@tanstack/react-router'
import { SuperAdminProjects } from '@/components/Pages/SuperAdminPages/SuperAdminProjects'

export const Route = createFileRoute('/_app/super-admin/projects')({
  component: SuperAdminProjects,
})
