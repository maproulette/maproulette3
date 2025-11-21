import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/manage/challenge/$challengeId')({
  head: () => ({
    meta: [
      {
        title: 'Challenge',
      },
    ],
  }),
})
