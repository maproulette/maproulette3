import { createContext, useContext, useMemo } from 'react'
import { navigation } from '@/data/site.json'
import { usePluginNavigation } from '@/hooks/usePluginNavigation'
import type { PluginNavigationItem } from '@/types/Plugin'

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
