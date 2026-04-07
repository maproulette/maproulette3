import { createFileRoute } from '@tanstack/react-router'
import { ManageTaskNew } from '@/components/Pages/ManagementPages/ManageTaskNew'

export const Route = createFileRoute('/_app/manage/task/new')({
  staticData: { pageTitle: 'Create Task' },
  component: ManageTaskNew,
})
