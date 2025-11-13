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
 * Loads a plugin from a remote URL using dynamic import
 */
export const loadPluginFromUrl = async (moduleUrl: string): Promise<PluginLoadResult> => {
  try {
    // Validate URL
    const url = new URL(moduleUrl)
    if (!url.protocol.startsWith('http')) {
      return {
        success: false,
        error: 'Only HTTP(S) URLs are supported',
      }
    }

    // Dynamic import of the plugin module
    const module = await import(/* @vite-ignore */ moduleUrl)
    
    // The module should export a default plugin object or a named export called 'plugin'
    const plugin: Plugin = module.default || module.plugin

    if (!plugin) {
      return {
        success: false,
        error: 'Plugin module does not export a valid plugin object',
      }
    }

    // Validate plugin structure
    if (!plugin.metadata || !plugin.metadata.id || !plugin.metadata.name) {
      return {
        success: false,
        error: 'Plugin is missing required metadata (id, name)',
      }
    }

    return {
      success: true,
      plugin,
    }
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

    script.onload = () => {
      try {
        // Access the plugin from the global scope
        const plugin = (window as any)[globalName]
        
        if (!plugin) {
          resolve({
            success: false,
            error: `Plugin not found at window.${globalName}`,
          })
          return
        }

        resolve({
          success: true,
          plugin,
        })
      } catch (error) {
        resolve({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to load plugin',
        })
      } finally {
        // Clean up
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

