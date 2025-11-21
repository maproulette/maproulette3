import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/manage/project/$projectId')({
  head: () => ({
    meta: [
      {
        title: 'Project',
      },
    ],
  }),
})
