import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/manage/task/$taskId')({
  head: () => ({
    meta: [
      {
        title: 'Task',
      },
    ],
  }),
})
