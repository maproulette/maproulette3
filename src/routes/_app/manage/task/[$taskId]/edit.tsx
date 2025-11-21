import { createFileRoute } from '@tanstack/react-router'
import { ManageTaskEdit } from '@/components/ManagementPages/ManageTaskEdit'

export const Route = createFileRoute('/_app/manage/task/$taskId/edit')({
  component: ManageTaskEdit,
})
