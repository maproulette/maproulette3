/**
 * Plugin registration
 * Import and register all available plugins here
 */
import { pluginRegistry } from './PluginRegistry'
import { RapidEditorPlugin } from './RapidEditorPlugin/RapidEditorPlugin'

// Register built-in plugins
pluginRegistry.register(RapidEditorPlugin)
