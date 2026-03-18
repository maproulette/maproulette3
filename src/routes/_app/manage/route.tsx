import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/manage')({
  beforeLoad: () => {
    throw redirect({ to: '/' })
  },
})
