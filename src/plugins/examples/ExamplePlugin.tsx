import { Lightbulb, Rocket, Sparkles } from 'lucide-react'
import type { Plugin, PluginNavigationItem, PluginPage } from '@/types/Plugin'

/**
 * Example page component
 */
const ExamplePageComponent = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-lg bg-lime-100 dark:bg-lime-900/20">
          <Lightbulb className="size-6 text-lime-600" />
        </div>
        <div>
          <h1 className="font-bold text-3xl">Example Plugin Page</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            This page is dynamically loaded from a plugin!
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-xl">
          <Rocket className="size-5" />
          Welcome to the Plugin System
        </h2>
        <div className="space-y-4 text-zinc-700 dark:text-zinc-300">
          <p>
            This is a demonstration of the MapRoulette plugin system. This entire page is loaded
            from a remote JavaScript module at runtime!
          </p>
          <p>Plugins can provide:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Custom navigation items in the header</li>
            <li>Full page components like this one</li>
            <li>Initialization and cleanup logic</li>
            <li>React to user settings changes</li>
          </ul>
        </div>
      </div>

      <div className="rounded-lg border border-lime-200 bg-lime-50 p-6 dark:border-lime-900 dark:bg-lime-900/20">
        <h3 className="mb-2 flex items-center gap-2 font-semibold text-lime-900 dark:text-lime-100">
          <Sparkles className="size-5" />
          How It Works
        </h3>
        <div className="space-y-2 text-lime-800 text-sm dark:text-lime-200">
          <p>1. Plugins are built as standalone ES modules using Vite</p>
          <p>2. They're served from a separate server (localhost:3002)</p>
          <p>3. Users can add plugin URLs in their account settings</p>
          <p>4. Enabled plugins are dynamically loaded and registered</p>
          <p>5. Plugin pages are rendered through the /plugin/:pluginId/:pageId route</p>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Plugin ID:{' '}
          <code className="rounded bg-zinc-200 px-2 py-1 dark:bg-zinc-800">example-plugin</code>
          {' • '}
          Page ID: <code className="rounded bg-zinc-200 px-2 py-1 dark:bg-zinc-800">main</code>
          {' • '}
          Version: <code className="rounded bg-zinc-200 px-2 py-1 dark:bg-zinc-800">1.0.0</code>
        </p>
      </div>
    </div>
  )
}

/**
 * Example plugin demonstrating the plugin system
 * This plugin adds a custom navigation item and page to MapRoulette
 */
export const ExamplePlugin: Plugin = {
  metadata: {
    id: 'example-plugin',
    name: 'Example Plugin',
    description:
      'A demonstration plugin that adds custom navigation items and pages to MapRoulette',
    version: '1.0.0',
    author: 'MapRoulette Team',
  },

  initialize: async () => {
    console.log('Example Plugin initialized!')
  },

  cleanup: async () => {
    console.log('Example Plugin cleaned up!')
  },

  getNavigationItems: (): PluginNavigationItem[] => {
    return [
      {
        id: 'example-nav-item',
        label: 'Example',
        to: '/plugin/example-plugin/main',
        icon: <Lightbulb className="size-4" />,
        order: 100,
      },
    ]
  },

  getPages: (): PluginPage[] => {
    return [
      {
        id: 'main',
        title: 'Example Plugin Page',
        description: 'Main page for the example plugin',
        component: ExamplePageComponent,
      },
    ]
  },

  onUserSettingsChange: (settings) => {
    console.log('Example Plugin: User settings changed', settings)
  },
}
