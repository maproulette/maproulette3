import { createFileRoute } from '@tanstack/react-router'
import { SuperAdminLayout } from '@/components/SuperAdminPages/SuperAdminLayout'

export const Route = createFileRoute('/_app/super-admin')({
  head: () => ({
    meta: [
      {
        title: 'Super Admin',
      },
    ],
  }),
  component: SuperAdminLayout,
})
