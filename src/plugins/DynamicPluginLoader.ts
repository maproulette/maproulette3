import type { Plugin } from '@/types/Plugin'

/**
 * Dynamic Plugin Loader
 * Loads plugins from remote URLs at runtime
 */

export interface PluginLoadResult {
  success: boolean
  plugin?: Plugin
  error?: string
}

export interface RemotePluginManifest {
  /** Plugin ID */
  id: string
  /** Display name */
  name: string
  /** Module URL to load the plugin from */
  moduleUrl: string
  /** Plugin version */
  version: string
  /** Optional description */
  description?: string
  /** Optional checksum for integrity verification */
  checksum?: string
}

/**
 * Loads a plugin from a remote URL using UMD script tag
 * Plugins should be built as UMD modules with React as a global
 */
export const loadPluginFromUrl = async (moduleUrl: string): Promise<PluginLoadResult> => {
  try {
    const url = new URL(moduleUrl)
    if (!url.protocol.startsWith('http')) {
      return {
        success: false,
        error: 'Only HTTP(S) URLs are supported',
      }
    }

    console.log('[DynamicPluginLoader] Loading plugin from:', moduleUrl)

    const fileName = url.pathname.split('/').pop() || ''
    const globalName = fileName.replace(/\.js$/, '')

    const result = await loadPluginViaScript(moduleUrl, globalName)

    if (result.success) {
      console.log(
        `[DynamicPluginLoader] Successfully loaded UMD plugin: ${result.plugin?.metadata.name}`
      )
      return result
    }

    console.error('Failed to load plugin as UMD:', result.error)
    return result
  } catch (error) {
    console.error('Failed to load plugin from URL:', moduleUrl, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load plugin module',
    }
  }
}

/**
 * Loads multiple plugins from an array of manifests
 */
export const loadPluginsFromManifests = async (
  manifests: RemotePluginManifest[]
): Promise<Map<string, PluginLoadResult>> => {
  const results = new Map<string, PluginLoadResult>()

  for (const manifest of manifests) {
    const result = await loadPluginFromUrl(manifest.moduleUrl)
    results.set(manifest.id, result)
  }

  return results
}

/**
 * Validates a plugin manifest
 */
export const validatePluginManifest = (manifest: unknown): manifest is RemotePluginManifest => {
  if (!manifest || typeof manifest !== 'object') {
    return false
  }

  const m = manifest as Record<string, unknown>

  return (
    typeof m.id === 'string' &&
    typeof m.name === 'string' &&
    typeof m.moduleUrl === 'string' &&
    typeof m.version === 'string'
  )
}

/**
 * Creates a script element to load a UMD/IIFE plugin
 * This is an alternative approach for plugins that aren't ESM modules
 */
export const loadPluginViaScript = (
  moduleUrl: string,
  globalName: string
): Promise<PluginLoadResult> => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = moduleUrl
    script.async = true
    script.crossOrigin = 'anonymous'

    script.onload = () => {
      try {
        const windowWithPlugin = window as unknown as Window & Record<string, unknown>
        const pluginModule = windowWithPlugin[globalName] as
          | { default?: Plugin; plugin?: Plugin }
          | Plugin
          | undefined

        let plugin: Plugin | undefined
        if (pluginModule) {
          if (typeof pluginModule === 'object' && 'metadata' in pluginModule) {
            plugin = pluginModule as Plugin
          } else if (typeof pluginModule === 'object') {
            const mod = pluginModule as { default?: Plugin; plugin?: Plugin }
            plugin = mod.default || mod.plugin
          }
        }

        if (!plugin) {
          resolve({
            success: false,
            error: `Plugin not found at window["${globalName}"]`,
          })
          document.head.removeChild(script)
          return
        }

        if (!plugin.metadata || !plugin.metadata.id || !plugin.metadata.name) {
          resolve({
            success: false,
            error: 'Plugin is missing required metadata (id, name)',
          })
          document.head.removeChild(script)
          return
        }

        console.log(
          `[DynamicPluginLoader] Successfully loaded plugin via UMD: ${plugin.metadata.name}`
        )

        resolve({
          success: true,
          plugin,
        })
      } catch (error) {
        resolve({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to load plugin',
        })
        document.head.removeChild(script)
      }
    }

    script.onerror = () => {
      resolve({
        success: false,
        error: 'Failed to load plugin script',
      })
      document.head.removeChild(script)
    }

    document.head.appendChild(script)
  })
}

/**
 * Fetches a plugin manifest from a remote URL
 * Useful when plugins are hosted with a manifest file
 */
export const fetchPluginManifest = async (
  manifestUrl: string
): Promise<RemotePluginManifest | null> => {
  try {
    const response = await fetch(manifestUrl)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (validatePluginManifest(data)) {
      return data
    }

    return null
  } catch (error) {
    console.error('Failed to fetch plugin manifest:', error)
    return null
  }
}
