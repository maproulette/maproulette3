import { DashboardPage } from '@/pages/dashboard'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/dashboard/')({
  component: DashboardPage,
})
