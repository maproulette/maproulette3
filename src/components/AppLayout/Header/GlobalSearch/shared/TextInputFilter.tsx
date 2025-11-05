import type { LucideIcon } from 'lucide-react'
import { X } from 'lucide-react'
import { useId } from 'react'

interface TextInputFilterProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  icon?: LucideIcon
  disabled?: boolean
  type?: 'text' | 'number' | 'email'
}

export const TextInputFilter = ({
  label,
  value,
  onChange,
  placeholder,
  icon: Icon,
  disabled = false,
  type = 'text',
}: TextInputFilterProps) => {
  const id = useId()

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 font-medium text-xs text-zinc-500 dark:text-zinc-400">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </div>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="-translate-y-1/2 absolute top-1/2 right-2 text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
            aria-label="Clear"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
