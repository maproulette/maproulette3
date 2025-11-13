import { createContext, useContext, useEffect, useState } from 'react'
import type { PluginLoadResult } from '@/plugins/DynamicPluginLoader'
import { pluginRegistry } from '@/plugins/PluginRegistry'
import type { Plugin, PluginConfiguration, PluginNavigationItem, PluginPage } from '@/types/Plugin'
import { useAuthContext } from './AuthContext'

interface PluginContextType {
  /** List of enabled plugin IDs for the current user */
  enabledPlugins: string[]
  /** Toggle a plugin on/off */
  togglePlugin: (pluginId: string, enabled: boolean) => void
  /** Get all available plugins */
  getAvailablePlugins: () => Plugin[]
  /** Get navigation items from all enabled plugins */
  getNavigationItems: () => Promise<PluginNavigationItem[]>
  /** Get a specific page from a plugin */
  getPluginPage: (pluginId: string, pageId: string) => Promise<PluginPage | null>
  /** Check if a plugin is enabled */
  isPluginEnabled: (pluginId: string) => boolean
  /** Register a plugin from a remote URL */
  registerPluginFromUrl: (moduleUrl: string) => Promise<PluginLoadResult>
  /** Remove a remote plugin */
  removeRemotePlugin: (pluginId: string) => Promise<void>
  /** Get all remote plugin URLs */
  getRemotePluginUrls: () => Map<string, string>
  /** Loading state */
  loading: boolean
  /** Error state */
  error: string | null
}

const PluginContext = createContext<PluginContextType | null>(null)

export const PluginProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthContext()
  const [enabledPlugins, setEnabledPlugins] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [remotePluginUrls, setRemotePluginUrls] = useState<string[]>([])

  // Load user's plugin preferences from localStorage (or API in production)
  useEffect(() => {
    const loadPluginPreferences = async () => {
      if (!user) {
        setEnabledPlugins([])
        setRemotePluginUrls([])
        setLoading(false)
        return
      }

      try {
        setError(null)

        // In production, this would be an API call to get user preferences
        // For now, we'll use localStorage with user-specific key
        const storageKey = `plugin_preferences_${user.id}`
        const stored = localStorage.getItem(storageKey)

        if (stored) {
          const preferences = JSON.parse(stored) as PluginConfiguration[]

          // Load remote plugins first
          const remotePlugins = preferences.filter((p) => p.source === 'remote' && p.moduleUrl)
          const remoteUrls: string[] = []

          for (const config of remotePlugins) {
            if (config.moduleUrl) {
              try {
                const result = await pluginRegistry.registerFromUrl(config.moduleUrl)
                if (result.success) {
                  remoteUrls.push(config.moduleUrl)
                  console.log(`Remote plugin loaded: ${result.plugin?.metadata.name}`)
                } else {
                  console.error(
                    `Failed to load remote plugin from ${config.moduleUrl}:`,
                    result.error
                  )
                  setError(`Failed to load plugin: ${result.error}`)
                }
              } catch (err) {
                console.error(`Error loading remote plugin from ${config.moduleUrl}:`, err)
              }
            }
          }

          setRemotePluginUrls(remoteUrls)

          // Get enabled plugins
          const enabled = preferences
            .filter((config) => config.enabled)
            .map((config) => config.pluginId)

          setEnabledPlugins(enabled)

          // Initialize enabled plugins
          for (const pluginId of enabled) {
            await pluginRegistry.initialize(pluginId)
          }
        }
      } catch (error) {
        console.error('Failed to load plugin preferences:', error)
        setError('Failed to load plugin preferences')
      } finally {
        setLoading(false)
      }
    }

    loadPluginPreferences()
  }, [user])

  const togglePlugin = async (pluginId: string, enabled: boolean) => {
    if (!user) return

    try {
      const newEnabledPlugins = enabled
        ? [...enabledPlugins, pluginId]
        : enabledPlugins.filter((id) => id !== pluginId)

      setEnabledPlugins(newEnabledPlugins)

      // Initialize or cleanup the plugin
      if (enabled) {
        await pluginRegistry.initialize(pluginId)
      } else {
        await pluginRegistry.cleanup(pluginId)
      }

      // Save to localStorage (in production, this would be an API call)
      const storageKey = `plugin_preferences_${user.id}`
      const allPlugins = pluginRegistry.getAllMetadata()
      const preferences: PluginConfiguration[] = allPlugins.map((metadata) => ({
        pluginId: metadata.id,
        enabled: newEnabledPlugins.includes(metadata.id),
      }))

      localStorage.setItem(storageKey, JSON.stringify(preferences))
    } catch (error) {
      console.error('Failed to toggle plugin:', error)
    }
  }

  const getAvailablePlugins = (): Plugin[] => {
    return pluginRegistry.getAll()
  }

  const getNavigationItems = async (): Promise<PluginNavigationItem[]> => {
    const items: PluginNavigationItem[] = []

    for (const pluginId of enabledPlugins) {
      const plugin = pluginRegistry.get(pluginId)
      if (plugin?.getNavigationItems) {
        try {
          const pluginItems = await plugin.getNavigationItems()
          items.push(...pluginItems)
        } catch (error) {
          console.error(`Failed to get navigation items from plugin ${pluginId}:`, error)
        }
      }
    }

    // Sort by order (if specified)
    items.sort((a, b) => {
      const orderA = a.order ?? 999
      const orderB = b.order ?? 999
      return orderA - orderB
    })

    return items
  }

  const isPluginEnabled = (pluginId: string): boolean => {
    return enabledPlugins.includes(pluginId)
  }

  const registerPluginFromUrl = async (moduleUrl: string): Promise<PluginLoadResult> => {
    if (!user) {
      return {
        success: false,
        error: 'User must be logged in to register plugins',
      }
    }

    try {
      setError(null)
      const result = await pluginRegistry.registerFromUrl(moduleUrl)

      if (result.success && result.plugin) {
        // Update remote plugin URLs
        const newUrls = [...remotePluginUrls, moduleUrl]
        setRemotePluginUrls(newUrls)

        // Save to localStorage
        const storageKey = `plugin_preferences_${user.id}`
        const stored = localStorage.getItem(storageKey)
        const preferences: PluginConfiguration[] = stored ? JSON.parse(stored) : []

        // Add the new remote plugin configuration
        preferences.push({
          pluginId: result.plugin.metadata.id,
          enabled: false,
          moduleUrl,
          source: 'remote',
        })

        localStorage.setItem(storageKey, JSON.stringify(preferences))

        return result
      }

      setError(result.error || 'Failed to register plugin')
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register plugin'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  const removeRemotePlugin = async (pluginId: string): Promise<void> => {
    if (!user) return

    try {
      setError(null)

      // Disable and cleanup the plugin first
      if (isPluginEnabled(pluginId)) {
        await togglePlugin(pluginId, false)
      }

      // Remove from registry
      const moduleUrl = pluginRegistry.getModuleUrl(pluginId)
      pluginRegistry.unregister(pluginId)

      // Update remote plugin URLs
      if (moduleUrl) {
        setRemotePluginUrls(remotePluginUrls.filter((url) => url !== moduleUrl))
      }

      // Remove from localStorage
      const storageKey = `plugin_preferences_${user.id}`
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const preferences: PluginConfiguration[] = JSON.parse(stored)
        const filtered = preferences.filter((p) => p.pluginId !== pluginId)
        localStorage.setItem(storageKey, JSON.stringify(filtered))
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove plugin'
      setError(errorMessage)
      console.error('Failed to remove remote plugin:', err)
    }
  }

  const getRemotePluginUrls = (): Map<string, string> => {
    return pluginRegistry.getRemotePluginUrls()
  }

  const getPluginPage = async (pluginId: string, pageId: string): Promise<PluginPage | null> => {
    const plugin = pluginRegistry.get(pluginId)
    if (!plugin?.getPages) {
      return null
    }

    try {
      const pages = await plugin.getPages()
      return pages.find((page) => page.id === pageId) || null
    } catch (error) {
      console.error(`Failed to get page ${pageId} from plugin ${pluginId}:`, error)
      return null
    }
  }

  const value: PluginContextType = {
    enabledPlugins,
    togglePlugin,
    getAvailablePlugins,
    getNavigationItems,
    getPluginPage,
    isPluginEnabled,
    registerPluginFromUrl,
    removeRemotePlugin,
    getRemotePluginUrls,
    loading,
    error,
  }

  return <PluginContext.Provider value={value}>{children}</PluginContext.Provider>
}

export const usePluginContext = () => {
  const context = useContext(PluginContext)
  if (!context) {
    throw new Error('usePluginContext must be used within a PluginProvider')
  }
  return context
}
