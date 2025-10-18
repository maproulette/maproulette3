import { Monitor, Moon, Sun } from 'lucide-react'
import { motion } from 'motion/react'
import { useCallback } from 'react'
import { useThemeContext } from '@/contexts/ThemeContext'
import { cn } from '@/lib/utils'

const themes = [
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
export type ThemeSwitcherProps = {
  value?: 'light' | 'dark' | 'system'
  onChange?: (theme: 'light' | 'dark' | 'system') => void
  defaultValue?: 'light' | 'dark' | 'system'
  className?: string
}

export const ThemeSwitcher = ({ className }: ThemeSwitcherProps) => {
  const { theme, setTheme } = useThemeContext()

  const handleThemeClick = useCallback(
    (themeKey: 'light' | 'dark' | 'system') => {
      setTheme(themeKey)
    },
    [setTheme]
  )

  return (
    <div
      className={cn(
        'relative isolate inline-flex h-8 rounded-full bg-zinc-100 p-1 dark:bg-zinc-950',
        className
      )}
    >
      {themes.map(({ key, icon: Icon, label }) => {
        const isActive = theme === key
        return (
          <button
            aria-label={label}
            className="relative flex size-6 cursor-pointer items-center justify-center rounded-full"
            key={key}
            onClick={() => handleThemeClick(key as 'light' | 'dark' | 'system')}
            type="button"
          >
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-full bg-zinc-200 dark:bg-zinc-800"
                layoutId="activeTheme"
                transition={{ type: 'spring', duration: 0.5 }}
              />
            )}
            <Icon
              className={cn(
                'relative z-10 size-3',
                isActive ? 'text-zinc-600 dark:text-zinc-50' : 'text-zinc-400 dark:text-zinc-500'
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
