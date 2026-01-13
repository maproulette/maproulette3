import { createFileRoute } from '@tanstack/react-router'
import { TasksLayout } from '@/components/TaskEditPage/TaskLayout'

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
