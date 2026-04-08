import { motion } from 'motion/react'
import { useThemeContext } from '@/contexts/ThemeContext'
import { cn } from '@/lib/utils'

export const ThemeSwitcher = () => {
  const { theme, themes, handleSetTheme } = useThemeContext()

  return (
    <div className="relative isolate inline-flex h-8 rounded-full bg-zinc-100 p-1 dark:bg-slate-950">
      {themes.map(({ key, icon: Icon, label }) => {
        const isActive = theme === key
        return (
          <button
            aria-label={label}
            className="relative flex size-6 cursor-pointer items-center justify-center rounded-full"
            key={key}
            onClick={() => handleSetTheme(key)}
            type="button"
          >
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-full bg-zinc-200 dark:bg-slate-800"
                layoutId="activeTheme"
                transition={{ type: 'spring', duration: 0.5 }}
              />
            )}
            <Icon
              className={cn(
                'relative z-10 size-3',
                isActive ? 'text-zinc-600 dark:text-white' : 'text-zinc-400 dark:text-white0'
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
