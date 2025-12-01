import { createFileRoute } from '@tanstack/react-router'
import { ProfilePage } from '@/components/ProfilePage'

export const Route = createFileRoute('/_app/profile')({
  head: () => ({
    meta: [
      {
        title: 'Profile',
      },
    ],
  }),
  component: ProfilePage,
})
