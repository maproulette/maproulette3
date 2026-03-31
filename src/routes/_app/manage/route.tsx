import { createFileRoute } from '@tanstack/react-router'
import { ManagementLayout } from '@/components/ManagementPages/ManagementLayout'

export const Route = createFileRoute('/_app/manage')({
  component: ManagementLayout,
})
