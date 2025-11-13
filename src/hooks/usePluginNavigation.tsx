import { useEffect, useState } from 'react'
import type { PluginNavigationItem } from '@/types/Plugin'
import { usePluginContext } from '@/contexts/PluginContext'

/**
 * Hook to get navigation items from all enabled plugins
 * This is called during render time and updates when enabled plugins change
 */
export const usePluginNavigation = () => {
  const { getNavigationItems, enabledPlugins, loading: pluginsLoading } = usePluginContext()
  const [navigationItems, setNavigationItems] = useState<PluginNavigationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadNavigationItems = async () => {
      if (pluginsLoading) return
      
      setLoading(true)
      setError(null)

      try {
        const items = await getNavigationItems()
        setNavigationItems(items)
      } catch (err) {
        console.error('Failed to load plugin navigation items:', err)
        setError(err instanceof Error ? err : new Error('Failed to load plugin navigation'))
      } finally {
        setLoading(false)
      }
    }

    loadNavigationItems()
  }, [enabledPlugins, pluginsLoading, getNavigationItems])

  return {
    navigationItems,
    loading,
    error,
  }
}

