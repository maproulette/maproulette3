import { Link } from '@tanstack/react-router'
import { ChevronRight, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ResultCardProps {
  title: string
  description?: string
  href: string
  params?: Record<string, string>
  onClick?: () => void
  icon?: LucideIcon
  badge?: {
    label: string
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  }
  metadata?: Array<{ label: string; value: string | number }>
}

const badgeVariants = {
  default: 'bg-zinc-100 text-zinc-700 dark:bg-slate-800 dark:text-slate-300',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
}

export const ResultCard = ({
  title,
  description,
  href,
  params,
  onClick,
  icon: Icon,
  badge,
  metadata,
}: ResultCardProps) => {
  return (
    <Link
      to={href}
      params={params}
      onClick={onClick}
      className={cn(
        'group flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2',
        'transition-all duration-200 hover:border-zinc-300 hover:shadow-md',
        'dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-slate-700 dark:hover:bg-slate-900'
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        {Icon && (
          <div className="shrink-0 rounded-md bg-zinc-100 p-1.5 dark:bg-slate-800">
            <Icon className="h-3.5 w-3.5 text-zinc-600 dark:text-slate-400" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="flex-1 truncate font-medium text-sm text-zinc-900 transition-colors group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
              {title}
            </h3>
            {badge && (
              <span
                className={cn(
                  'shrink-0 rounded-full px-1.5 py-0.5 font-medium text-xs',
                  badgeVariants[badge.variant || 'default']
                )}
              >
                {badge.label}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-0.5 line-clamp-1 text-xs text-zinc-600 dark:text-slate-400">
              {description}
            </p>
          )}
          {metadata && metadata.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-zinc-500 dark:text-slate-400">
              {metadata.map((item) => (
                <span key={`${item.label}-${item.value}`}>
                  <span className="font-medium">{item.label}:</span> {item.value}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-zinc-400 transition-all group-hover:translate-x-0.5 group-hover:text-emerald-500 dark:text-slate-500 dark:group-hover:text-emerald-400" />
    </Link>
  )
}
