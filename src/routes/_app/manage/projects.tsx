import { createFileRoute } from '@tanstack/react-router'
import { ManageProjects } from '@/components/ManagementPages/ManageProjects'

export const Route = createFileRoute('/_app/manage/projects')({
  component: ManageProjects,
})
