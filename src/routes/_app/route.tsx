import { createFileRoute } from '@tanstack/react-router'
import { App } from '@/pages/_layouts/app'

export const Route = createFileRoute('/_app')({
  component: App,
})
