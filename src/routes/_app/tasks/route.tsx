import { TasksLayout } from '@/pages/tasks/taskLayout'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/tasks')({
  head: () => ({
    meta: [
      {
        title: 'Tasks',
      },
    ],
  }),
  component: TasksLayout,
})
