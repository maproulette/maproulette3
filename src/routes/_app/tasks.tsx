import { TasksLayout } from '@/pages/tasks/layout'
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
