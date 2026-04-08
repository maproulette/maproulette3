import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { usePluginContext } from '@/contexts/PluginContext'
import { navigation } from '@/data/site.json'
import { logger } from '@/lib/logger'
import type { PluginNavigationItem } from '@/types/Plugin'

const usePluginNavigation = () => {
  const { getNavigationItems, enabledPlugins, loading: pluginsLoading } = usePluginContext()
  const [navigationItems, setNavigationItems] = useState<PluginNavigationItem[]>([])

  useEffect(() => {
    const loadNavigationItems = async () => {
      if (pluginsLoading) return

      try {
        const items = await getNavigationItems()
        setNavigationItems(items)
      } catch (err) {
        logger.error('Failed to load plugin navigation items', { error: err })
      }
    }

    loadNavigationItems()
  }, [enabledPlugins, pluginsLoading, getNavigationItems])

  return { navigationItems }
}

interface NavigationContextType {
  allNavigationItems: PluginNavigationItem[]
}

const NavigationContext = createContext<NavigationContextType>({
  allNavigationItems: [],
})

export const NavigationProvider = ({ children }: { children: React.ReactNode }) => {
  const { main: mainNavigation } = navigation
  const { navigationItems: pluginNavigationItems } = usePluginNavigation()

  // Reason: combines static + plugin navigation, used as context value dependency
  const allNavigationItems: PluginNavigationItem[] = useMemo(
    () => [
      ...mainNavigation.map((item) => ({ ...item, id: item.to, icon: undefined })),
      ...pluginNavigationItems,
    ],
    [mainNavigation, pluginNavigationItems]
  )

  // Reason: context value must be stable to prevent all consumers from re-rendering
  const value = useMemo(() => ({ allNavigationItems }), [allNavigationItems])

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
}

export const useNavigationContext = () => useContext(NavigationContext)
