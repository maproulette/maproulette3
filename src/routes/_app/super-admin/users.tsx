import { createFileRoute } from '@tanstack/react-router'
import { SuperAdminUsers } from '@/components/SuperAdminPages/SuperAdminUsers'

export const Route = createFileRoute('/_app/super-admin/users')({
  component: SuperAdminUsers,
})

