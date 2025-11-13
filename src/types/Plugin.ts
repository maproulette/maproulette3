import type { ReactNode } from 'react'

/**
 * Navigation item that can be provided by a plugin
 */
export interface PluginNavigationItem {
  /** Unique identifier for the navigation item */
  id: string
  /** Display label for the navigation item */
  label: string
  /** Route path or URL */
  to: string
  /** Icon component (optional) */
  icon?: ReactNode
  /** Whether to open in a new tab */
  openInNewTab?: boolean
  /** Order/priority for display (lower numbers appear first) */
  order?: number
}

/**
 * Plugin metadata
 */
export interface PluginMetadata {
  /** Unique identifier for the plugin */
  id: string
  /** Display name of the plugin */
  name: string
  /** Plugin description */
  description: string
  /** Plugin version */
  version: string
  /** Plugin author */
  author?: string
}

/**
 * Main plugin interface that all plugins must implement
 */
export interface Plugin {
  /** Plugin metadata */
  metadata: PluginMetadata

  /**
   * Initialize the plugin
   * Called when the plugin is first loaded
   */
  initialize?: () => void | Promise<void>

  /**
   * Cleanup the plugin
   * Called when the plugin is disabled or unloaded
   */
  cleanup?: () => void | Promise<void>

  /**
   * Get navigation items to display in the header
   * This is called during render time for each enabled plugin
   */
  getNavigationItems?: () => PluginNavigationItem[] | Promise<PluginNavigationItem[]>

  /**
   * Optional hook to extend the plugin with custom functionality
   */
  onUserSettingsChange?: (settings: Record<string, unknown>) => void
}

/**
 * Plugin configuration stored per user
 */
export interface PluginConfiguration {
  /** Plugin ID */
  pluginId: string
  /** Whether the plugin is enabled */
  enabled: boolean
  /** Custom settings for the plugin */
  settings?: Record<string, unknown>
  /** Optional module URL for dynamically loaded plugins */
  moduleUrl?: string
  /** Whether this is a built-in or remote plugin */
  source?: 'builtin' | 'remote'
}

/**
 * User plugin preferences
 */
export interface UserPluginPreferences {
  /** List of plugin configurations */
  plugins: PluginConfiguration[]
  /** List of remote plugin URLs to load */
  remotePluginUrls?: string[]
}

