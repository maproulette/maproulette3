import { createFileRoute } from '@tanstack/react-router'
import { SuperAdminSettings } from '@/components/Pages/SuperAdminPages/SuperAdminSettings'

export const Route = createFileRoute('/_app/super-admin/settings')({
  staticData: { pageTitle: 'Settings' },
  component: SuperAdminSettings,
})
