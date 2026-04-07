import { createFileRoute } from '@tanstack/react-router'
import { ManageTasksOpen } from '@/components/Pages/ManagementPages/ManageTasksOpen'

export const Route = createFileRoute('/_app/manage/tasks')({
  component: ManageTasksOpen,
})
