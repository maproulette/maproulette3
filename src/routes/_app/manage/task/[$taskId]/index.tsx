import { createFileRoute } from '@tanstack/react-router'
import { ManageTaskDetail } from '@/components/ManagementPages/ManageTaskDetail'

export const Route = createFileRoute('/_app/manage/task/$taskId/')({
  staticData: { pageTitle: 'Manage Task' },
  component: ManageTaskDetail,
})
