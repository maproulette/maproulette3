import type { Plugin, PluginApiContext } from '@/types/Plugin'
import { loadPluginFromUrl, type PluginLoadResult } from './DynamicPluginLoader'
import { validatePluginUrl, validatePluginUrls } from './pluginSecurity'

/**
 * Central registry for all available plugins
 * Plugins must be registered here to be available to users
 */
class PluginRegistry {
  private plugins: Map<string, Plugin> = new Map()
  private initializedPlugins: Set<string> = new Set()
  private remotePluginUrls: Map<string, string> = new Map() // pluginId -> moduleUrl
  private apiContext: PluginApiContext | null = null

  /**
   * Register a plugin in the registry
   */
  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.metadata.id)) {
      console.warn(`Plugin ${plugin.metadata.id} is already registered`)
      return
    }
    this.plugins.set(plugin.metadata.id, plugin)
    console.log(`Plugin registered: ${plugin.metadata.name} (${plugin.metadata.id})`)
  }

  /**
   * Unregister a plugin from the registry
   */
  unregister(pluginId: string): void {
    const plugin = this.plugins.get(pluginId)
    if (plugin) {
      if (this.initializedPlugins.has(pluginId)) {
        plugin.cleanup?.()
        this.initializedPlugins.delete(pluginId)
      }
      this.plugins.delete(pluginId)
      console.log(`Plugin unregistered: ${pluginId}`)
    }
  }

  /**
   * Get a plugin by ID
   */
  get(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId)
  }

  /**
   * Get all registered plugins
   */
  getAll(): Plugin[] {
    return Array.from(this.plugins.values())
  }

  /**
   * Get all plugin metadata
   */
  getAllMetadata(): Array<Plugin['metadata']> {
    return Array.from(this.plugins.values()).map((plugin) => plugin.metadata)
  }

  /**
   * Set the API context that will be provided to plugins
   */
  setApiContext(context: PluginApiContext): void {
    this.apiContext = context
  }

  /**
   * Initialize a plugin
   */
  async initialize(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      console.warn(`Plugin ${pluginId} not found`)
      return
    }

    if (this.initializedPlugins.has(pluginId)) {
      console.warn(`Plugin ${pluginId} is already initialized`)
      return
    }

    try {
      await plugin.initialize?.(this.apiContext ?? undefined)
      this.initializedPlugins.add(pluginId)
      console.log(`Plugin initialized: ${plugin.metadata.name}`)
    } catch (error) {
      console.error(`Failed to initialize plugin ${pluginId}:`, error)
    }
  }

  /**
   * Cleanup a plugin
   */
  async cleanup(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      return
    }

    if (!this.initializedPlugins.has(pluginId)) {
      return
    }

    try {
      await plugin.cleanup?.()
      this.initializedPlugins.delete(pluginId)
      console.log(`Plugin cleaned up: ${plugin.metadata.name}`)
    } catch (error) {
      console.error(`Failed to cleanup plugin ${pluginId}:`, error)
    }
  }

  /**
   * Check if a plugin is initialized
   */
  isInitialized(pluginId: string): boolean {
    return this.initializedPlugins.has(pluginId)
  }

  /**
   * Register a plugin from a remote URL
   * URL must be in the security allowlist
   */
  async registerFromUrl(moduleUrl: string): Promise<PluginLoadResult> {
    // Validate URL against security allowlist
    if (!validatePluginUrl(moduleUrl)) {
      return {
        success: false,
        error:
          'Plugin URL not allowed. URL must be from an approved host. See plugin security documentation.',
      }
    }

    const result = await loadPluginFromUrl(moduleUrl)

    if (result.success && result.plugin) {
      this.register(result.plugin)
      this.remotePluginUrls.set(result.plugin.metadata.id, moduleUrl)
    }

    return result
  }

  /**
   * Register multiple plugins from URLs
   * Validates all URLs before loading
   */
  async registerFromUrls(moduleUrls: string[]): Promise<Map<string, PluginLoadResult>> {
    const results = new Map<string, PluginLoadResult>()
    const { valid, invalid } = validatePluginUrls(moduleUrls)

    // Add errors for invalid URLs
    for (const url of invalid) {
      results.set(url, {
        success: false,
        error: `Plugin URL not allowed: ${url}`,
      })
    }

    // Load valid URLs
    for (const url of valid) {
      const result = await this.registerFromUrl(url)
      if (result.plugin) {
        results.set(result.plugin.metadata.id, result)
      } else {
        results.set(url, result)
      }
    }

    return results
  }

  /**
   * Get the module URL for a remote plugin
   */
  getModuleUrl(pluginId: string): string | undefined {
    return this.remotePluginUrls.get(pluginId)
  }

  /**
   * Check if a plugin was loaded from a remote URL
   */
  isRemotePlugin(pluginId: string): boolean {
    return this.remotePluginUrls.has(pluginId)
  }

  /**
   * Get all remote plugin URLs
   */
  getRemotePluginUrls(): Map<string, string> {
    return new Map(this.remotePluginUrls)
  }
}

// Export singleton instance
export const pluginRegistry = new PluginRegistry()
