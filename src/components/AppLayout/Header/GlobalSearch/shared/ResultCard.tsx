import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ResultCardProps {
  title: string
  description?: string
  href: string
  onClick?: () => void
  metadata?: { label: string; value: string | number }[]
  badge?: {
    label: string
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  }
}

const badgeVariants = {
  default: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
}

export const ResultCard = ({
  title,
  description,
  href,
  onClick,
  metadata,
  badge,
}: ResultCardProps) => {
  return (
    <Link
      to={href}
      onClick={onClick}
      className={cn(
        'group flex items-start justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3.5',
        'transition-all duration-200 hover:scale-[1.005] hover:border-zinc-300 hover:shadow-lg',
        'dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700 dark:hover:bg-zinc-900'
      )}
    >
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-start gap-2">
          <h3 className="flex-1 font-semibold text-sm text-zinc-900 transition-colors group-hover:text-emerald-600 dark:text-zinc-100 dark:group-hover:text-emerald-400">
            {title}
          </h3>
          {badge && (
            <span
              className={cn(
                'shrink-0 rounded-full px-2 py-0.5 font-medium text-xs',
                badgeVariants[badge.variant || 'default']
              )}
            >
              {badge.label}
            </span>
          )}
        </div>

        {description && (
          <p className="line-clamp-2 text-xs text-zinc-600 leading-relaxed dark:text-zinc-400">
            {description}
          </p>
        )}

        {metadata && metadata.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {metadata.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5 text-xs">
                <span className="text-zinc-500 dark:text-zinc-500">{item.label}:</span>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <ChevronRight className="mt-0.5 ml-3 h-5 w-5 shrink-0 text-zinc-400 transition-all group-hover:translate-x-1 group-hover:text-emerald-500 dark:text-zinc-500 dark:group-hover:text-emerald-400" />
    </Link>
  )
}
