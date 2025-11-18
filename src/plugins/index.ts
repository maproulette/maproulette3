/**
 * Plugin registration
 * Import and register all available plugins here
 */
import { pluginRegistry } from './PluginRegistry'
import RapidEditorPlugin from './RapidEditorPlugin/RapidEditorPlugin'

// Register built-in plugins
pluginRegistry.register(RapidEditorPlugin)

// Export the registry for use throughout the app
export { pluginRegistry }
export { usePluginContext } from '@/contexts/PluginContext'
export type {
  Plugin,
  PluginMetadata,
  PluginNavigationItem,
  PluginPage,
  TaskMapEditor,
} from '@/types/Plugin'
