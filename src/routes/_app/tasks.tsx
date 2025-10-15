import { createFileRoute } from '@tanstack/react-router'
import { TaskPageLayout } from '../layouts/TaskPageLayout'

export const Route = createFileRoute('/_app/tasks')({
  component: TaskPageLayout,
})
