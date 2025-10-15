import { createFileRoute } from '@tanstack/react-router'
import { App } from '@/pages/layouts/app'

export const Route = createFileRoute('/_app')({
  component: App,
})
