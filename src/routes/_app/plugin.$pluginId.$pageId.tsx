import { createFileRoute } from '@tanstack/react-router'
import { PluginPage } from '@/components/PluginPage'

export const Route = createFileRoute('/_app/plugin/$pluginId/$pageId')({
  component: PluginPage,
})

