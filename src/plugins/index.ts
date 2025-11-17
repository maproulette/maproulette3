/**
 * Plugin registration
 * Import and register all available plugins here
 */
import { pluginRegistry } from './PluginRegistry'

// Export the registry for use throughout the app
export { pluginRegistry }
export { usePluginContext } from '@/contexts/PluginContext'
export type { Plugin, PluginMetadata, PluginNavigationItem, PluginPage } from '@/types/Plugin'
