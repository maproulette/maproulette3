import { Monitor, Moon, Sun } from 'lucide-react'
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

type Theme = 'dark' | 'light' | 'system'

const themes: { key: Theme; icon: React.ElementType; label: string }[] = [
  {
    key: 'system',
    icon: Monitor,
    label: 'System theme',
  },
  {
    key: 'light',
    icon: Sun,
    label: 'Light theme',
  },
  {
    key: 'dark',
    icon: Moon,
    label: 'Dark theme',
  },
]

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  handleThemeClick: (themeKey: Theme) => void
  themes: typeof themes
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  handleThemeClick: () => null,
  themes,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('app-theme') as Theme) || 'system'
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const handleThemeClick = useCallback((themeKey: Theme) => {
    localStorage.setItem('app-theme', themeKey)
    setTheme(themeKey)
  }, [])

  const handleSetTheme = useCallback((theme: Theme) => {
    localStorage.setItem('app-theme', theme)
    setTheme(theme)
  }, [])

  // Reason: context value must be stable to prevent all consumers from re-rendering
  const value = useMemo(
    () => ({
      theme,
      setTheme: handleSetTheme,
      handleThemeClick,
      themes,
    }),
    [theme, handleSetTheme, handleThemeClick]
  )

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>
}

export const useThemeContext = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
