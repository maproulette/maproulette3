import { createFileRoute } from '@tanstack/react-router'
import { SettingsPage } from '@/components/SettingsPage'

export const Route = createFileRoute('/_app/settings')({
  head: () => ({
    meta: [
      {
        title: 'Settings',
      },
    ],
  }),
  component: SettingsPage,
})
