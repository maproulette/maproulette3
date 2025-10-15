  import { AppLayout } from '@/pages/layout'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app')({
  component: AppLayout,
})
