import { createFileRoute } from '@tanstack/react-router'
import { ManageProjectEdit } from '@/components/ManagementPages/ManageProjectEdit'

export const Route = createFileRoute('/_app/manage/project/$projectId/edit')({
  component: ManageProjectEdit,
})
