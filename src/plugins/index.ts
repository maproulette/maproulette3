/**
 * Plugin registration
 * Import and register all available plugins here
 */
import { pluginRegistry } from './PluginRegistry'

/**
 * Register all available plugins
 * This function should be called during app initialization
 */
export const registerPlugins = () => {
  // Register example plugins
  // pluginRegistry.register(ExamplePlugin)
  // pluginRegistry.register(AnalyticsPlugin)

  // Add more plugins here as they are created
  // pluginRegistry.register(YourCustomPlugin)
}

// Export the registry for use throughout the app
export { pluginRegistry }
export { usePluginContext } from '@/contexts/PluginContext'
export type { Plugin, PluginNavigationItem, PluginMetadata, PluginPage } from '@/types/Plugin'

