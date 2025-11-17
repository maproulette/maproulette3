import type { ComponentType, ReactNode } from 'react'

/**
 * Route parameters extracted from dynamic paths
 */
export interface RouteParams {
  [key: string]: string
}

/**
 * API context provided to plugins from MapRoulette
 * All API methods are React hooks that return { data, isLoading, error }
 */
export interface PluginApiContext {
  /** API hooks for making requests */
  api: {
    /** Task API hooks */
    task: {
      /** Hook to get a task by ID */
      useTask: (taskId: number) => { data: any; isLoading: boolean; error: any }
      /** Hook to start a task */
      useStartTask: (taskId: number) => { data: any; isLoading: boolean; error: any }
      /** Hook to get task markers */
      useTaskMarkers: (params: any) => { data: any; isLoading: boolean; error: any }
    }
    /** Challenge API hooks */
    challenge: {
      /** Hook to get a challenge by ID */
      useChallenge: (challengeId: number) => { data: any; isLoading: boolean; error: any }
      /** Hook to get challenge task markers */
      useChallengeTaskMarkers: (challengeId: number) => { data: any; isLoading: boolean; error: any }
    }
    /** User API hooks */
    user: {
      /** Hook to get current user */
      useCurrentUser: () => { data: any; isLoading: boolean; error: any }
    }
    /** Project API hooks */
    project: {
      /** Hook to get a project by ID */
      useProject: (projectId: number) => { data: any; isLoading: boolean; error: any }
    }
  }
  /** Base API request function (ky instance) for custom requests */
  apiRequest: any
}

/**
 * Navigation item that can be provided by a plugin
 */
export interface PluginNavigationItem {
  /** Unique identifier for the navigation item */
  id: string
  /** Display label for the navigation item */
  label: string
  /** Route path or URL (e.g., '/example', 'https://external.com') */
  to: string
  /** Icon component (optional) */
  icon?: ReactNode
  /** Whether to open in a new tab */
  openInNewTab?: boolean
  /** Order/priority for display (lower numbers appear first) */
  order?: number
}

/**
 * Plugin page definition
 */
export interface PluginPage {
  /** Unique identifier for the page */
  id: string
  /** Display title */
  title: string
  /** Component to render - receives route params as props */
  component: ComponentType<{ params?: RouteParams }>
  /** 
   * Custom route path with optional parameters 
   * Examples: '/example', '/tasks/:id/review', '/challenges/:challengeId/tasks/:taskId'
   */
  path: string
  /** Optional description */
  description?: string
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
  /** Optional icon URL */
  icon?: string
  /** Optional homepage URL */
  homepage?: string
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
   * @param context - API context providing access to MapRoulette APIs
   */
  initialize?: (context?: PluginApiContext) => void | Promise<void>

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
   * Get pages provided by this plugin
   * Each page defines its own custom route path (e.g., '/example')
   */
  getPages?: () => PluginPage[] | Promise<PluginPage[]>

  /**
   * Optional hook to extend the plugin with custom functionality
   */
  onUserSettingsChange?: (settings: Record<string, unknown>) => void
  
  /**
   * React to app events
   */
  onEvent?: (event: string, data?: unknown) => void
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
