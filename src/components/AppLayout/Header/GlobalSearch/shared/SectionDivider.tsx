import type { LucideIcon } from 'lucide-react'

interface SectionDividerProps {
  label?: string
  icon?: LucideIcon
}

export const SectionDivider = ({ label, icon: Icon }: SectionDividerProps) => {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-zinc-200 border-t dark:border-zinc-800" />
      </div>
      {label && (
        <div className="relative flex justify-center">
          <span className="flex items-center gap-2 bg-white px-3 font-medium text-xs text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
            {Icon && <Icon className="h-3 w-3" />}
            {label}
          </span>
        </div>
      )}
    </div>
  )
}
