import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api, apiRequest } from '@/api'
import type { PluginLoadResult } from '@/plugins/DynamicPluginLoader'
import { pluginRegistry } from '@/plugins/PluginRegistry'
import type {
  Plugin,
  PluginApiContext,
  PluginConfiguration,
  PluginNavigationItem,
  PluginPage,
  RouteParams,
  TaskMapEditor,
} from '@/types/Plugin'
import { useAuthContext } from './AuthContext'

const matchPath = (pattern: string, path: string): { matched: boolean; params: RouteParams } => {
  const normalizedPattern =
    pattern.endsWith('/') && pattern.length > 1 ? pattern.slice(0, -1) : pattern
  const normalizedPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path

  if (!normalizedPattern.includes(':')) {
    return { matched: normalizedPattern === normalizedPath, params: {} }
  }

  const patternSegments = normalizedPattern.split('/').filter(Boolean)
  const pathSegments = normalizedPath.split('/').filter(Boolean)

  if (patternSegments.length !== pathSegments.length) {
    return { matched: false, params: {} }
  }

  const params: RouteParams = {}

  for (let i = 0; i < patternSegments.length; i++) {
    const patternSegment = patternSegments[i]
    const pathSegment = pathSegments[i]

    if (patternSegment.startsWith(':')) {
      params[patternSegment.slice(1)] = pathSegment
    } else if (patternSegment !== pathSegment) {
      return { matched: false, params: {} }
    }
  }

  return { matched: true, params }
}

export interface PluginPageMatch {
  page: PluginPage
  params: RouteParams
}

interface PluginContextType {
  enabledPlugins: string[]
  togglePlugin: (pluginId: string, enabled: boolean) => void
  getAvailablePlugins: () => Plugin[]
  getNavigationItems: () => Promise<PluginNavigationItem[]>
  getPluginPage: (pluginId: string, pageId: string) => Promise<PluginPage | null>
  getPluginPageByPath: (path: string) => Promise<PluginPageMatch | null>
  getTaskMapEditors: () => Promise<TaskMapEditor[]>
  isPluginEnabled: (pluginId: string) => boolean
  registerPluginFromUrl: (moduleUrl: string) => Promise<PluginLoadResult>
  removeRemotePlugin: (pluginId: string) => Promise<void>
  getRemotePluginUrls: () => Map<string, string>
  loading: boolean
  error: string | null
}

const defaultPluginContext: PluginContextType = {
  enabledPlugins: [],
  togglePlugin: () => {},
  getAvailablePlugins: () => [],
  getNavigationItems: async () => [],
  getPluginPage: async () => null,
  getPluginPageByPath: async () => null,
  getTaskMapEditors: async () => [],
  isPluginEnabled: () => false,
  registerPluginFromUrl: async () => ({ success: false, error: 'Not authenticated' }),
  removeRemotePlugin: async () => {},
  getRemotePluginUrls: () => new Map(),
  loading: false,
  error: null,
}

const PluginContext = createContext<PluginContextType | null>(null)

export const PluginProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthContext()

  if (!user) {
    return <PluginContext.Provider value={defaultPluginContext}>{children}</PluginContext.Provider>
  }

  return <PluginProviderInner user={user}>{children}</PluginProviderInner>
}

const PluginProviderInner = ({
  children,
  user,
}: {
  children: React.ReactNode
  user: NonNullable<ReturnType<typeof useAuthContext>['user']>
}) => {
  const [enabledPlugins, setEnabledPlugins] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [remotePluginUrls, setRemotePluginUrls] = useState<string[]>([])

  useEffect(() => {
    const apiContext: PluginApiContext = {
      api: {
        task: {
          useTask: api.task.getTask,
          useStartTask: api.task.startTask,
          useTaskMarkers: api.task.getTaskMarkers,
        },
        challenge: {
          useChallenge: api.challenge.getChallenge,
          useChallengeTaskMarkers: api.challenge.getChallengeTaskMarkers,
        },
        user: {
          useCurrentUser: () => api.user.whoAmI(false),
        },
        project: {
          useProject: api.project.getProject,
        },
      },
      apiRequest,
    }

    pluginRegistry.setApiContext(apiContext)
  }, [])

  useEffect(() => {
    const loadPluginPreferences = async () => {
      try {
        setError(null)

        const storageKey = `plugin_preferences_${user.id}`
        const stored = localStorage.getItem(storageKey)

        if (stored) {
          const preferences = JSON.parse(stored) as PluginConfiguration[]

          const remotePlugins = preferences.filter((p) => p.source === 'remote' && p.moduleUrl)
          const remoteUrls: string[] = []

          for (const config of remotePlugins) {
            if (config.moduleUrl) {
              try {
                const result = await pluginRegistry.registerFromUrl(config.moduleUrl)
                if (result.success) {
                  remoteUrls.push(config.moduleUrl)
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

          const enabled = preferences
            .filter((config) => config.enabled)
            .map((config) => config.pluginId)

          setEnabledPlugins(enabled)

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
    try {
      const newEnabledPlugins = enabled
        ? [...enabledPlugins, pluginId]
        : enabledPlugins.filter((id) => id !== pluginId)

      setEnabledPlugins(newEnabledPlugins)

      if (enabled) {
        await pluginRegistry.initialize(pluginId)
      } else {
        await pluginRegistry.cleanup(pluginId)
      }

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
    try {
      setError(null)
      const result = await pluginRegistry.registerFromUrl(moduleUrl)

      if (result.success && result.plugin) {
        const newUrls = [...remotePluginUrls, moduleUrl]
        setRemotePluginUrls(newUrls)

        const storageKey = `plugin_preferences_${user.id}`
        const stored = localStorage.getItem(storageKey)
        const preferences: PluginConfiguration[] = stored ? JSON.parse(stored) : []

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
    try {
      setError(null)

      if (isPluginEnabled(pluginId)) {
        await togglePlugin(pluginId, false)
      }

      const moduleUrl = pluginRegistry.getModuleUrl(pluginId)
      pluginRegistry.unregister(pluginId)

      if (moduleUrl) {
        setRemotePluginUrls(remotePluginUrls.filter((url) => url !== moduleUrl))
      }

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

  const getPluginPageByPath = async (path: string): Promise<PluginPageMatch | null> => {
    for (const pluginId of enabledPlugins) {
      const plugin = pluginRegistry.get(pluginId)

      if (plugin?.getPages) {
        try {
          const pages = await plugin.getPages()

          for (const page of pages) {
            const matchResult = matchPath(page.path, path)

            if (matchResult.matched) {
              return {
                page,
                params: matchResult.params,
              }
            }
          }
        } catch (error) {
          console.error(`Failed to get pages from plugin ${pluginId}:`, error)
        }
      }
    }

    return null
  }

  const getTaskMapEditors = async (): Promise<TaskMapEditor[]> => {
    const editors: TaskMapEditor[] = []

    for (const pluginId of enabledPlugins) {
      const plugin = pluginRegistry.get(pluginId)
      if (plugin?.getTaskMapEditors) {
        try {
          const pluginEditors = await plugin.getTaskMapEditors()
          editors.push(...pluginEditors)
        } catch (error) {
          console.error(`Failed to get task map editors from plugin ${pluginId}:`, error)
        }
      }
    }

    editors.sort((a, b) => {
      const orderA = a.order ?? 999
      const orderB = b.order ?? 999
      return orderA - orderB
    })

    return editors
  }

  // Reason: context value must be stable to prevent all consumers from re-rendering
  const value: PluginContextType = useMemo(
    () => ({
      enabledPlugins,
      togglePlugin,
      getAvailablePlugins,
      getNavigationItems,
      getPluginPage,
      getPluginPageByPath,
      getTaskMapEditors,
      isPluginEnabled,
      registerPluginFromUrl,
      removeRemotePlugin,
      getRemotePluginUrls,
      loading,
      error,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enabledPlugins, loading, error, remotePluginUrls]
  )

  return <PluginContext.Provider value={value}>{children}</PluginContext.Provider>
}

export const usePluginContext = () => {
  const context = useContext(PluginContext)
  if (!context) {
    throw new Error('usePluginContext must be used within a PluginProvider')
  }
  return context
}
