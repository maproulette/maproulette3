import type { LucideIcon } from 'lucide-react'
import { Search } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export const EmptyState = ({
  icon: Icon = Search,
  title,
  description,
  action,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="rounded-full bg-zinc-100 p-4 dark:bg-slate-800">
        <Icon className="h-8 w-8 text-zinc-400 dark:text-slate-500" />
      </div>
      <div className="space-y-1.5 text-center">
        <p className="font-semibold text-base text-zinc-900 dark:text-white">{title}</p>
        {description && <p className="text-sm text-zinc-500 dark:text-slate-400">{description}</p>}
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
