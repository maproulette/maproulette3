import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { NotificationsPage } from '@/components/Pages/NotificationsPage'

const notificationsSearchSchema = z.object({
  notificationId: z.coerce.number().optional(),
})

export const Route = createFileRoute('/_app/notifications')({
  validateSearch: notificationsSearchSchema,
  staticData: { pageTitle: 'Notifications' },
  head: () => ({
    meta: [
      {
        title: 'Notifications',
      },
    ],
  }),
  component: NotificationsPage,
})

