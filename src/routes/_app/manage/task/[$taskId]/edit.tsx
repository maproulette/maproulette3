import { createFileRoute } from '@tanstack/react-router'
import { ManageTaskEdit } from '@/components/Pages/ManagementPages/ManageTaskEdit'

export const Route = createFileRoute('/_app/manage/task/$taskId/edit')({
  component: ManageTaskEdit,
})
