import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  label: string
  preferred?: boolean
  onRemove?: () => void
}

export const TagChip = ({ label, preferred = false, onRemove }: Props) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs',
      preferred
        ? 'border border-teal-500 bg-teal-50 text-teal-800 dark:border-teal-400 dark:bg-teal-950/40 dark:text-teal-200'
        : 'bg-zinc-200 text-zinc-700 dark:bg-slate-700 dark:text-slate-200'
    )}
  >
    {label}
    {onRemove && (
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove tag ${label}`}
        className="rounded-full p-0.5 hover:bg-zinc-900/10 dark:hover:bg-white/10"
      >
        <X className="size-3" aria-hidden="true" />
      </button>
    )}
  </span>
)
