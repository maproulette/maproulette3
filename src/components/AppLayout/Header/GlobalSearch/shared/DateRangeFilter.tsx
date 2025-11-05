import { Calendar } from 'lucide-react'
import { useId } from 'react'

interface DateRangeFilterProps {
  label: string
  startDate?: string
  endDate?: string
  onChange: (dates: { startDate?: string; endDate?: string }) => void
  disabled?: boolean
}

export const DateRangeFilter = ({
  label,
  startDate,
  endDate,
  onChange,
  disabled = false,
}: DateRangeFilterProps) => {
  const startId = useId()
  const endId = useId()

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 font-medium text-xs text-zinc-500 dark:text-zinc-400">
        <Calendar className="h-3 w-3" />
        {label}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label htmlFor={startId} className="text-xs text-zinc-600 dark:text-zinc-400">
            From
          </label>
          <input
            id={startId}
            type="date"
            value={startDate || ''}
            onChange={(e) => onChange({ startDate: e.target.value, endDate })}
            disabled={disabled}
            className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor={endId} className="text-xs text-zinc-600 dark:text-zinc-400">
            To
          </label>
          <input
            id={endId}
            type="date"
            value={endDate || ''}
            onChange={(e) => onChange({ startDate, endDate: e.target.value })}
            disabled={disabled}
            className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </div>
      </div>
    </div>
  )
}
