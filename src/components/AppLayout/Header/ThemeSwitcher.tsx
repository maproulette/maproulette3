import { motion } from 'motion/react'
import { useThemeContext } from '@/components/ThemeContext'

export const ThemeSwitcher = () => {
  const { theme, themes, handleThemeClick } = useThemeContext()

  return (
    <div className="relative isolate inline-flex h-8 rounded-full bg-zinc-100 p-1 dark:bg-zinc-950">
      {themes.map(({ key, icon: Icon, label }) => {
        const isActive = theme === key
        return (
          <button
            aria-label={label}
            className="relative flex size-6 cursor-pointer items-center justify-center rounded-full"
            key={key}
            onClick={() => handleThemeClick(key)}
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
              className={`relative z-10 size-3 ${isActive ? 'text-zinc-600 dark:text-zinc-50' : 'text-zinc-400 dark:text-zinc-500'}`}
            />
          </button>
        )
      })}
    </div>
  )
}
