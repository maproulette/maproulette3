import { Lightbulb } from 'lucide-react'
import type { Plugin, PluginNavigationItem } from '@/types/Plugin'

/**
 * Example plugin demonstrating the plugin system
 * This plugin adds a custom navigation item to the header
 */
export const ExamplePlugin: Plugin = {
  metadata: {
    id: 'example-plugin',
    name: 'Example Plugin',
    description: 'A demonstration plugin that adds custom navigation items to MapRoulette',
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
        to: '/example',
        icon: <Lightbulb className="size-4" />,
        order: 100,
      },
    ]
  },

  onUserSettingsChange: (settings) => {
    console.log('Example Plugin: User settings changed', settings)
  },
}

