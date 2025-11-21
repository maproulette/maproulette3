import { createFileRoute } from '@tanstack/react-router'
import { ManageProjectDetail } from '@/components/ManagementPages/ManageProjectDetail'

export const Route = createFileRoute('/_app/manage/project/$projectId/')({
  component: ManageProjectDetail,
})
