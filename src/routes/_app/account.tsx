import { createFileRoute } from '@tanstack/react-router'
import { Account } from '@/components/AccountPage'

export const Route = createFileRoute('/_app/account')({
  head: () => ({
    meta: [
      {
        title: 'Account',
      },
    ],
  }),
  component: Account,
})
