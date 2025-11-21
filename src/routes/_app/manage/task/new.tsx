import { createFileRoute } from '@tanstack/react-router'
import { ManageTaskNew } from '@/components/ManagementPages/ManageTaskNew'

export const Route = createFileRoute('/_app/manage/task/new')({
  component: ManageTaskNew,
})
