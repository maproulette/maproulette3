import { createFileRoute } from '@tanstack/react-router'
import { AccountForm } from '@/components/AccountForm'
import { useAuth } from '@/contexts/AuthContext'

export const Route = createFileRoute('/_app/account')({
  head: () => ({
    meta: [
      {
        title: 'Account',
      },
    ],
  }),
  component: () => {
    const { user } = useAuth()
    return <AccountForm user={user} />
  },
})
