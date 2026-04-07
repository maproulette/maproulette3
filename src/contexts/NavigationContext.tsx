import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { usePluginContext } from '@/contexts/PluginContext'
import { navigation } from '@/data/site.json'
import type { PluginNavigationItem } from '@/types/Plugin'

const usePluginNavigation = () => {
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

  return { navigationItems, loading, error }
}

interface NavigationContextValue {
  allNavigationItems: PluginNavigationItem[]
}

const NavigationContext = createContext<NavigationContextValue>({
  allNavigationItems: [],
})

export const NavigationProvider = ({ children }: { children: React.ReactNode }) => {
  const { main: mainNavigation } = navigation
  const { navigationItems: pluginNavigationItems } = usePluginNavigation()

  const allNavigationItems: PluginNavigationItem[] = useMemo(
    () => [
      ...mainNavigation.map((item) => ({ ...item, id: item.to, icon: undefined })),
      ...pluginNavigationItems,
    ],
    [mainNavigation, pluginNavigationItems]
  )

  return (
    <NavigationContext.Provider value={{ allNavigationItems }}>
      {children}
    </NavigationContext.Provider>
  )
}

export const useNavigation = () => useContext(NavigationContext)
