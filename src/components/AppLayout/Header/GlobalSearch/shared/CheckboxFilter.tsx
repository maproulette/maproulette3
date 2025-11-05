import { useId } from 'react'

interface CheckboxFilterProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  description?: string
  disabled?: boolean
}

export const CheckboxFilter = ({
  label,
  checked,
  onChange,
  description,
  disabled = false,
}: CheckboxFilterProps) => {
  const id = useId()

  return (
    <div className="space-y-1">
      <div className="flex items-start gap-2.5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-emerald-600 transition-colors focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:focus:ring-offset-zinc-950"
        />
        <div className="flex-1">
          <label
            htmlFor={id}
            className="cursor-pointer font-medium text-sm text-zinc-900 transition-colors hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300"
          >
            {label}
          </label>
          {description && (
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
          )}
        </div>
      </div>
    </div>
  )
}
