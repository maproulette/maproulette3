import { createFileRoute } from '@tanstack/react-router'
import { ManageHome } from '@/components/ManagementPages/ManageHome'

export const Route = createFileRoute('/_app/manage/')({
  staticData: { pageTitle: 'Manage' },
  component: ManageHome,
})
